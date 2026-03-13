import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class S3Service {
  private s3: AWS.S3;
  private bucket: string;

  constructor(private configService: ConfigService) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION'),
    });
    this.bucket = this.configService.get('AWS_S3_BUCKET');
  }

  async uploadFile(
    file: Express.Multer.File,
    folder?: string,
    fileName?: string,
  ): Promise<{ url: string; key: string }> {
    const key = this.buildKey(folder, fileName || file.originalname);

    const params = {
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read' as any,
    };

    const result = await this.s3.upload(params).promise();

    return {
      url: result.Location,
      key: result.Key,
    };
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3
      .deleteObject({
        Bucket: this.bucket,
        Key: key,
      })
      .promise();
  }

  private buildKey(folder?: string, fileName?: string): string {
    const timestamp = Date.now();
    const name = fileName || `file-${timestamp}`;
    return folder ? `${folder}/${name}` : name;
  }
}
