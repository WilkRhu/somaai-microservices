import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'OCR Service is running!';
  }

  health() {
    return {
      status: 'ok',
      service: 'ocr-service',
      timestamp: new Date().toISOString(),
    };
  }
}
