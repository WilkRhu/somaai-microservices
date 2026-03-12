import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'business-service',
    };
  }

  getInfo() {
    return {
      name: 'Business Service',
      version: '1.0.0',
      description: 'API para gerenciamento de estabelecimentos e operações de negócio',
      status: 'running',
    };
  }
}
