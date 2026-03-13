import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Service } from './services/s3.service';
import { FtpService } from './services/ftp.service';
import { UploadProvider } from './enums/upload-provider.enum';

interface UploadRecord {
  id: string;
  fileName: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
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
    file: Express.Multer.File,
    folder?: string,
    fileName?: string,
  ): Promise<{ id: string; url: string; fileName: string }> {
    try {
      if (!file) {
        throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
      }

      let result;

      if (this.provider === UploadProvider.S3) {
        result = await this.s3Service.uploadFile(file, folder, fileName);
      } else {
        result = await this.ftpService.uploadFile(file, folder, fileName);
      }

      const id = this.generateId();
      const record: UploadRecord = {
        id,
        fileName: result.key || result.path,
        originalName: file.originalname,
        url: result.url,
        size: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date(),
        provider: this.provider,
      };

      this.uploadRecords.set(id, record);

      return {
        id,
        url: result.url,
        fileName: file.originalname,
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

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
