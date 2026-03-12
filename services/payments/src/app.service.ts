import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Payments Service is running';
  }

  health() {
    return {
      status: 'ok',
      service: 'payments',
      timestamp: new Date().toISOString(),
    };
  }
}
