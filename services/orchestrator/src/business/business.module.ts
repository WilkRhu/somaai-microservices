import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';

@Module({
  imports: [HttpModule],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}
