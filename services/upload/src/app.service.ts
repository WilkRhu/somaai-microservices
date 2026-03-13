import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'upload',
      timestamp: new Date().toISOString(),
    };
  }
}
