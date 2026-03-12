import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { DeliveryEntity } from './entities/delivery.entity';
import { DeliveryProducerService } from '../kafka/delivery.producer';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryEntity])],
  controllers: [DeliveryController],
  providers: [DeliveryService, DeliveryProducerService],
})
export class DeliveryModule {}
