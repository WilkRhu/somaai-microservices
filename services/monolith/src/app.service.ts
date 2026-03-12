import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Monolith Service is running!';
  }

  health() {
    return {
      status: 'ok',
      service: 'monolith-service',
      timestamp: new Date().toISOString(),
    };
  }
}
