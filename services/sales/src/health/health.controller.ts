import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async health() {
    return this.healthService.getHealth();
  }

  @Get('ready')
  async readiness() {
    return this.healthService.getReadiness();
  }

  @Get('live')
  async liveness() {
    return this.healthService.getLiveness();
  }
}
