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

  async getExpiringItems(establishmentId: string, daysAhead: number = 30) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    futureDate.setHours(23, 59, 59, 999);

    return await this.inventoryRepository
      .createQueryBuilder('item')
      .where('item.establishmentId = :establishmentId', { establishmentId })
      .andWhere('item.isActive = true')
      .andWhere('item.expirationDate IS NOT NULL')
      .andWhere('item.expirationDate >= :today', { today })
      .andWhere('item.expirationDate <= :futureDate', { futureDate })
      .orderBy('item.expirationDate', 'ASC')
      .getMany();
  }

  async getLowStockItems(establishmentId: string) {
    return await this.inventoryRepository
      .createQueryBuilder('item')
      .where('item.establishmentId = :establishmentId', { establishmentId })
      .andWhere('item.isActive = true')
      .andWhere('item.quantity <= item.minQuantity')
      .orderBy('item.quantity', 'ASC')
      .getMany();
  }

  async findByEstablishment(
    establishmentId: string,
    filters?: {
      search?: string;
      category?: string;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    },
  ) {
    let query = this.inventoryRepository
      .createQueryBuilder('item')
      .where('item.establishmentId = :establishmentId', { establishmentId })
      .andWhere('item.isActive = true');

    if (filters?.search) {
      query = query.andWhere(
        '(item.name ILIKE :search OR item.barcode ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters?.category) {
      query = query.andWhere('item.category = :category', {
        category: filters.category,
      });
    }

    const sortBy = filters?.sortBy || 'createdAt';
    const sortOrder = filters?.sortOrder || 'DESC';
    query = query.orderBy(`item.${sortBy}`, sortOrder);

    return await query.getMany();
  }
}
