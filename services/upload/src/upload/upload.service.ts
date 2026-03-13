import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Service } from './services/s3.service';
import { FtpService } from './services/ftp.service';
import { UploadProvider } from './enums/upload-provider.enum';

export interface UploadRecord {
  id: string;
  fileName: string;
  url: string;
  size: number;
  uploadedAt: Date;
  provider: UploadProvider;
}

@Injectable()
export class UploadService {
  private uploadRecords: Map<string, UploadRecord> = new Map();
  private provider: UploadProvider;

  constructor(
    private configService: ConfigService,
    private s3Service: S3Service,
    private ftpService: FtpService,
  ) {
    this.provider = (this.configService.get('UPLOAD_PROVIDER') ||
      'S3') as UploadProvider;
  }

  async uploadFile(
    file?: any,
    base64?: string,
    folder?: string,
    fileName?: string,
  ): Promise<{ id: string; url: string; fileName: string }> {
    try {
      if (!file && !base64) {
        throw new HttpException(
          'No file or base64 provided',
          HttpStatus.BAD_REQUEST,
        );
      }

      let fileBuffer: Buffer;
      let mimeType: string;
      let originalName: string;

      if (base64) {
        const result = this.parseBase64(base64);
        fileBuffer = result.buffer;
        mimeType = result.mimeType;
        originalName = fileName || `image-${Date.now()}`;
      } else {
        fileBuffer = file.buffer;
        mimeType = file.mimetype;
        originalName = fileName || file.originalname;
      }

      let uploadResult;

      try {
        uploadResult = await this.s3Service.uploadFile(
          fileBuffer,
          folder,
          originalName,
          mimeType,
        );
      } catch (s3Error) {
        console.warn('S3 upload failed, trying FTP fallback:', s3Error);
        uploadResult = await this.ftpService.uploadFile(
          fileBuffer,
          folder,
          originalName,
          mimeType,
        );
      }

      const id = this.generateId();
      const record: UploadRecord = {
        id,
        fileName: originalName,
        url: uploadResult.url,
        size: fileBuffer.length,
        uploadedAt: new Date(),
        provider: this.provider,
      };

      this.uploadRecords.set(id, record);

      return {
        id,
        url: uploadResult.url,
        fileName: originalName,
      };
    } catch (error) {
      throw new HttpException(
        `Upload failed: ${error instanceof Error ? error.message : String(error)}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getUploadInfo(id: string): Promise<UploadRecord> {
    const record = this.uploadRecords.get(id);

    if (!record) {
      throw new HttpException('Upload not found', HttpStatus.NOT_FOUND);
    }

    return record;
  }

  private parseBase64(base64String: string): {
    buffer: Buffer;
    mimeType: string;
  } {
    let mimeType = 'application/octet-stream';
    let data = base64String;

    if (base64String.startsWith('data:')) {
      const matches = base64String.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        data = matches[2];
      }
    }

    const buffer = Buffer.from(data, 'base64');
    return { buffer, mimeType };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
