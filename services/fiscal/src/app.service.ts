import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Fiscal Service is running';
  }

  health() {
    return {
      status: 'ok',
      service: 'fiscal',
      timestamp: new Date().toISOString(),
    };
  }
}
