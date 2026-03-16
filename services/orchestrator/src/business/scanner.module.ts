import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScannerGateway } from './scanner.gateway';

@Module({
  imports: [HttpModule],
  providers: [ScannerGateway],
})
export class ScannerModule {}
