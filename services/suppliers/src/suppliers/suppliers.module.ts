import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { SupplierEntity } from './entities/supplier.entity';
import { SuppliersProducerService } from '../kafka/suppliers.producer';

@Module({
  imports: [TypeOrmModule.forFeature([SupplierEntity])],
  controllers: [SuppliersController],
  providers: [SuppliersService, SuppliersProducerService],
})
export class SuppliersModule {}
