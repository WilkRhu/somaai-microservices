import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItemEntity } from './entities/inventory-item.entity';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { InventoryItemResponseDto } from './dto/inventory-item-response.dto';
import { InventoryProducerService } from '../kafka/inventory.producer';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItemEntity)
    private itemRepository: Repository<InventoryItemEntity>,
    private inventoryProducer: InventoryProducerService,
  ) {}

  async createItem(dto: CreateInventoryItemDto): Promise<InventoryItemResponseDto> {
    try {
      const item = this.itemRepository.create({
        productId: dto.productId,
        quantity: dto.quantity,
        minQuantity: dto.minQuantity,
        maxQuantity: dto.maxQuantity,
      });

      await this.itemRepository.save(item);

      await this.inventoryProducer.publishInventoryUpdated({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
      });

      return this.mapToDto(item);
    } catch (error) {
      throw new HttpException(
        `Failed to create inventory item: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getItemById(id: string): Promise<InventoryItemResponseDto> {
    const item = await this.itemRepository.findOne({ where: { id } });

    if (!item) {
      throw new HttpException('Inventory item not found', HttpStatus.NOT_FOUND);
    }

    return this.mapToDto(item);
  }

  async listItems(productId?: string): Promise<InventoryItemResponseDto[]> {
    const query = this.itemRepository.createQueryBuilder('item');

    if (productId) {
      query.where('item.productId = :productId', { productId });
    }

    const items = await query.orderBy('item.createdAt', 'DESC').getMany();

    return items.map((item) => this.mapToDto(item));
  }

  async updateItem(id: string, dto: UpdateInventoryItemDto): Promise<InventoryItemResponseDto> {
    const item = await this.itemRepository.findOne({ where: { id } });

    if (!item) {
      throw new HttpException('Inventory item not found', HttpStatus.NOT_FOUND);
    }

    const oldQuantity = item.quantity;
    Object.assign(item, dto);
    await this.itemRepository.save(item);

    if (item.quantity < item.minQuantity) {
      await this.inventoryProducer.publishLowStockAlert({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        minQuantity: item.minQuantity,
      });
    }

    if (item.quantity > oldQuantity) {
      await this.inventoryProducer.publishRestocked({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
      });
    }

    await this.inventoryProducer.publishInventoryUpdated({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
    });

    return this.mapToDto(item);
  }

  async deleteItem(id: string): Promise<void> {
    const item = await this.itemRepository.findOne({ where: { id } });

    if (!item) {
      throw new HttpException('Inventory item not found', HttpStatus.NOT_FOUND);
    }

    await this.itemRepository.remove(item);
  }

  async checkStockLevels(itemId: string): Promise<{ isLowStock: boolean; quantity: number; minQuantity: number }> {
    const item = await this.itemRepository.findOne({ where: { id: itemId } });

    if (!item) {
      throw new HttpException('Inventory item not found', HttpStatus.NOT_FOUND);
    }

    const isLowStock = item.quantity < item.minQuantity;

    if (isLowStock) {
      await this.inventoryProducer.publishLowStockAlert({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        minQuantity: item.minQuantity,
      });
    }

    return {
      isLowStock,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
    };
  }

  async checkReorderPoints(): Promise<any[]> {
    const items = await this.itemRepository.find();
    const reorderItems = [];

    for (const item of items) {
      if (item.quantity <= item.minQuantity) {
        const reorderQuantity = item.maxQuantity - item.quantity;
        reorderItems.push({
          id: item.id,
          productId: item.productId,
          currentQuantity: item.quantity,
          reorderQuantity,
          minQuantity: item.minQuantity,
          maxQuantity: item.maxQuantity,
        });

        await this.inventoryProducer.publishLowStockAlert({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          minQuantity: item.minQuantity,
        });
      }
    }

    return reorderItems;
  }

  private mapToDto(item: InventoryItemEntity): InventoryItemResponseDto {
    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      maxQuantity: item.maxQuantity,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
