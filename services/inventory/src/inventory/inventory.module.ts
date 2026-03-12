import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryItemEntity } from './entities/inventory-item.entity';
import { InventoryProducerService } from '../kafka/inventory.producer';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryItemEntity])],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryProducerService],
})
export class InventoryModule {}
