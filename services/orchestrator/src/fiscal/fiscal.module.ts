import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FiscalService } from './fiscal.service';
import { FiscalController } from './fiscal.controller';

@Module({
  imports: [HttpModule],
  controllers: [FiscalController],
  providers: [FiscalService],
  exports: [FiscalService],
})
export class FiscalModule {}
