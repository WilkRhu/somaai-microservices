import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InventoryItem } from './entities/inventory-item.entity';
import { StockMovement } from './entities/stock-movement.entity';

@Injectable()
export class InventoryService {
  private uploadServiceUrl = process.env.UPLOAD_SERVICE_URL || 'http://localhost:3008';

  constructor(
    @InjectRepository(InventoryItem)
    private readonly inventoryRepository: Repository<InventoryItem>,
    @InjectRepository(StockMovement)
    private readonly stockMovementRepository: Repository<StockMovement>,
    private readonly httpService: HttpService,
  ) {}

  private async uploadImages(images: string[]): Promise<string[]> {
    const urls: string[] = [];
    for (const img of images) {
      if (!img.startsWith('data:')) {
        urls.push(img);
        continue;
      }
      try {
        const response = await firstValueFrom(
          this.httpService.post(`${this.uploadServiceUrl}/upload`, { base64: img, folder: 'inventory' }),
        );
        urls.push(response.data.url);
      } catch {
        // upload falhou, ignora
      }
    }
    return urls;
  }

  async addImages(id: string, images: string[]): Promise<any> {
    const item = await this.findOne(id);
    if (!item) throw new Error('Item not found');
    const uploadedUrls = await this.uploadImages(images);
    const current = item.images || [];
    item.images = [...current, ...uploadedUrls];
    await this.inventoryRepository.save(item);
    return { success: true, data: await this.findOne(id) };
  }

  async removeImages(id: string, images: string[]): Promise<any> {
    const item = await this.findOne(id);
    if (!item) throw new Error('Item not found');
    const toRemove = images || [];
    const current = item.images || [];
    item.images = toRemove.length ? current.filter(img => !toRemove.includes(img)) : [];
    await this.inventoryRepository.save(item);
    return { success: true, data: await this.findOne(id) };
  }

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
    return await this.inventoryRepository
      .createQueryBuilder('item')
      .where('item.id = :id', { id })
      .getOne();
  }

  async update(id: string, updateItemDto: any) {
    await this.inventoryRepository.update(id, updateItemDto);
    const updated = await this.findOne(id);
    return { success: true, data: updated };
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
      page?: number;
      limit?: number;
    },
  ) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

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

    const [data, total] = await query.skip(skip).take(limit).getManyAndCount();

    return {
      success: true,
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async decreaseStock(inventoryItemId: string, quantity: number) {
    const item = await this.findOne(inventoryItemId);
    if (!item) throw new Error('Item not found');
    if (item.quantity < quantity) throw new Error('Insufficient stock');

    const newQuantity = item.quantity - quantity;
    await this.inventoryRepository.update(inventoryItemId, { quantity: newQuantity });

    // Registra o movimento de estoque
    await this.recordMovement({
      inventoryItemId,
      type: 'SALE',
      quantity: -quantity,
      reason: 'Sale',
    });

    return await this.findOne(inventoryItemId);
  }
}
