import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  getInfo() {
    return {
      name: 'SomaAI Orchestrator Service',
      version: '1.0.0',
      description: 'Central orchestrator for microservices',
    };
  }
}
