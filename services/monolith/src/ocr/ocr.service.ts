import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private ocrServiceUrl = process.env.OCR_SERVICE_URL || 'http://localhost:3007';

  constructor(private httpService: HttpService) {}

  async extractBase64(data: any, authToken: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.ocrServiceUrl}/api/ocr/extract-base64`, data, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Error calling OCR service: ${error.message}`);
      throw new HttpException(
        error.response?.data || 'Error calling OCR service',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
