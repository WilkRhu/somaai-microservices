import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OcrService {
  private ocrServiceUrl = process.env.OCR_SERVICE_URL || 'http://localhost:3009';

  constructor(private httpService: HttpService) {}

  async proxyRequest(method: string, path: string, data?: any, headers?: any) {
    const url = `${this.ocrServiceUrl}${path}`;

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method: method.toLowerCase(),
          url,
          data,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        }),
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // OCR
  async processImage(data: any) {
    return this.proxyRequest('POST', '/api/ocr/process', data);
  }

  async getOcrResult(id: string) {
    return this.proxyRequest('GET', `/api/ocr/${id}`);
  }

  async listOcrResults(skip?: number, take?: number) {
    return this.proxyRequest('GET', `/api/ocr?skip=${skip || 0}&take=${take || 20}`);
  }
}
