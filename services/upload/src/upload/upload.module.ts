import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { S3Service } from './services/s3.service';
import { FtpService } from './services/ftp.service';

@Module({
  controllers: [UploadController],
  providers: [UploadService, S3Service, FtpService],
  exports: [UploadService],
})
export class UploadModule {}
