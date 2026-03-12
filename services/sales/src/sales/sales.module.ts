import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { SaleEntity } from './entities/sale.entity';
import { SalesProducerService } from '../kafka/sales.producer';

@Module({
  imports: [TypeOrmModule.forFeature([SaleEntity])],
  controllers: [SalesController],
  providers: [SalesService, SalesProducerService],
})
export class SalesModule {}
