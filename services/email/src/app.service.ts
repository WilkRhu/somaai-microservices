import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'email-service',
      timestamp: new Date().toISOString(),
    };
  }
}
