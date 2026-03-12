import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { StockMovement } from './entities/stock-movement.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private readonly inventoryRepository: Repository<InventoryItem>,
    @InjectRepository(StockMovement)
    private readonly stockMovementRepository: Repository<StockMovement>,
  ) {}

  async create(createItemDto: any) {
    const item = this.inventoryRepository.create(createItemDto);
    return await this.inventoryRepository.save(item);
  }

  async findAll(establishmentId: string) {
    return await this.inventoryRepository.find({
      where: { establishmentId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    return await this.inventoryRepository.findOne({ where: { id } });
  }

  async update(id: string, updateItemDto: any) {
    await this.inventoryRepository.update(id, updateItemDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.inventoryRepository.delete(id);
  }

  async recordMovement(createMovementDto: any) {
    const movement = this.stockMovementRepository.create(createMovementDto);
    return await this.stockMovementRepository.save(movement);
  }

  async getMovements(inventoryItemId: string) {
    return await this.stockMovementRepository.find({
      where: { inventoryItemId },
      order: { createdAt: 'DESC' },
    });
  }
}
