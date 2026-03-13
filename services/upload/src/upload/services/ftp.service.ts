import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'basic-ftp';
import { Readable } from 'stream';

@Injectable()
export class FtpService {
  private client: Client;

  constructor(private configService: ConfigService) {
    this.client = new Client();
  }

  async uploadFile(
    fileData: Buffer,
    folder?: string,
    fileName?: string,
    mimeType?: string,
  ): Promise<{ url: string; path: string }> {
    try {
      await this.client.access({
        host: this.configService.get('FTP_HOST'),
        port: parseInt(this.configService.get('FTP_PORT') || '21'),
        user: this.configService.get('FTP_USER'),
        password: this.configService.get('FTP_PASS'),
        secure: this.configService.get('FTP_SECURE') === 'true',
      });

      const basePath = this.configService.get('FTP_BASE_PATH') || '/uploads';
      const uploadPath = folder ? `${basePath}/${folder}` : basePath;

      await this.ensureDirectoryExists(uploadPath);

      const originalName = fileName || `file-${Date.now()}`;
      const remotePath = `${uploadPath}/${originalName}`;

      const stream = Readable.from(fileData);
      await this.client.uploadFrom(stream, remotePath);

      const ftpHost = this.configService.get('FTP_HOST');
      const url = `ftp://${ftpHost}${remotePath}`;

      return {
        url,
        path: remotePath,
      };
    } finally {
      this.client.close();
    }
  }

  private async ensureDirectoryExists(path: string): Promise<void> {
    try {
      await this.client.cd(path);
    } catch {
      const parts = path.split('/').filter(p => p);
      let currentPath = '';

      for (const part of parts) {
        currentPath += `/${part}`;
        try {
          await this.client.cd(currentPath);
        } catch {
          try {
            await (this.client as any).ensureDir(currentPath);
          } catch {
            // Directory creation not supported, continue
          }
        }
      }
    }
  }
}
