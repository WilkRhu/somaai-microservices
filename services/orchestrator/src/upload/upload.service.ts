import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UploadService {
  private uploadServiceUrl = process.env.UPLOAD_SERVICE_URL || 'http://localhost:3008';

  constructor(private httpService: HttpService) {}

  async upload(file: any, body: any): Promise<any> {
    try {
      const FormData = require('form-data');
      const form = new FormData();

      if (file) {
        form.append('file', file.buffer, { filename: file.originalname, contentType: file.mimetype });
      }
      if (body.base64) form.append('base64', body.base64);
      if (body.folder) form.append('folder', body.folder);
      if (body.fileName) form.append('fileName', body.fileName);

      const response = await firstValueFrom(
        this.httpService.post(`${this.uploadServiceUrl}/upload`, form, {
          headers: form.getHeaders(),
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || error.message,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
