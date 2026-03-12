import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(private readonly dataSource: DataSource) {}

  async getHealth() {
    const dbHealthy = await this.checkDatabase();
    
    return {
      status: dbHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbHealthy ? 'connected' : 'disconnected',
        kafka: 'connected',
      },
    };
  }

  async getReadiness() {
    const dbHealthy = await this.checkDatabase();
    
    return {
      ready: dbHealthy,
      timestamp: new Date().toISOString(),
    };
  }

  async getLiveness() {
    return {
      alive: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }
}
