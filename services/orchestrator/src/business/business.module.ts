import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CommonModule } from '../common/common.module';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { ScannerModule } from './scanner.module';

@Module({
  imports: [HttpModule, CommonModule, ScannerModule],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}
