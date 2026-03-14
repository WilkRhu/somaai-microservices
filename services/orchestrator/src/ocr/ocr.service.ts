import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private ocrServiceUrl = process.env.OCR_SERVICE_URL || 'http://localhost:3007';

  constructor(private httpService: HttpService) {}

  async proxyRequest(method: string, path: string, data?: any, headers?: any) {
    const url = `${this.ocrServiceUrl}${path}`;

    try {
      this.logger.debug(`Proxying ${method} request to ${url}`);
      
      const response = await firstValueFrom(
        this.httpService.request({
          method: method.toLowerCase(),
          url,
          data,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          timeout: 30000,
        }),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Error proxying request to OCR service: ${error.message}`);
      this.logger.error(`Full error:`, error);
      
      if (error instanceof AxiosError) {
        this.logger.error(`Response status: ${error.response?.status}`);
        this.logger.error(`Response data:`, error.response?.data);
        const status = error.response?.status || HttpStatus.SERVICE_UNAVAILABLE;
        const message = error.response?.data?.message || error.message || 'OCR service error';
        throw new HttpException(message, status);
      }
      
      throw new HttpException(
        'Error connecting to OCR service',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  // OCR
  async extractBase64(data: any) {
    return this.proxyRequest('POST', '/api/ocr/extract-base64', data);
  }
}
