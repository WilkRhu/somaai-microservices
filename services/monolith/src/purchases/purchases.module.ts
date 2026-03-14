import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { KafkaModule } from '../kafka/kafka.module';
import { Purchase } from './entities/purchase.entity';
import { PurchaseItem } from './entities/purchase-item.entity';
import { PurchaseInstallment } from './entities/purchase-installment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Purchase, PurchaseItem, PurchaseInstallment]),
    HttpModule,
    KafkaModule,
  ],
  controllers: [PurchasesController],
  providers: [PurchasesService],
  exports: [PurchasesService],
})
export class PurchasesModule {}
