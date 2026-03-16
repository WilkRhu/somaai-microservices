import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { SaleStatus } from './enums/sale-status.enum';
import { InventoryService } from '../inventory/inventory.service';
import { StockMovementType } from '../inventory/enums/stock-movement-type.enum';
import { OffersService } from '../offers/offers.service';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private readonly saleItemRepository: Repository<SaleItem>,
    private readonly inventoryService: InventoryService,
    @Inject(forwardRef(() => OffersService))
    private readonly offersService: OffersService,
  ) {}

  async create(createSaleDto: any) {
    // Gera um número de venda único se não fornecido
    if (!createSaleDto.saleNumber) {
      createSaleDto.saleNumber = `SALE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    // Extrai os items antes de salvar a venda
    const items = createSaleDto.items || [];
    delete createSaleDto.items;

    // Calcula subtotal e total se não fornecidos
    if (!createSaleDto.subtotal || !createSaleDto.total) {
      const subtotal = items.reduce((sum: number, item: any) => {
        return sum + (item.unitPrice * item.quantity);
      }, 0);
      const discount = createSaleDto.discount || 0;
      const total = subtotal - discount;

      createSaleDto.subtotal = subtotal;
      createSaleDto.total = total;
    }

    // Cria a venda
    const sale = this.saleRepository.create(createSaleDto);
    const savedSale = await this.saleRepository.save(sale) as unknown as Sale;

    // Adiciona os items
    for (const item of items) {
      await this.addItem(savedSale.id, item);
    }

    // Retorna a venda com items
    return await this.findOne(savedSale.id);
  }

  async findAll(establishmentId: string) {
    return await this.saleRepository.find({
      where: { establishmentId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    return await this.saleRepository.findOne({
      where: { id },
      relations: ['items'],
    });
  }

  async update(id: string, updateSaleDto: any) {
    await this.saleRepository.update(id, updateSaleDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.saleRepository.delete(id);
  }

  async addItem(saleId: string, createSaleItemDto: any) {
    // Aplica preço de oferta se existir
    if (createSaleItemDto.itemId) {
      const activeOffer = await this.offersService.getActiveOfferForItem(createSaleItemDto.itemId);
      if (activeOffer && !createSaleItemDto.offerApplied) {
        createSaleItemDto.unitPrice = activeOffer.offerPrice;
        createSaleItemDto.offerApplied = true;
      }
    }

    // Calcula o total do item se não fornecido
    if (!createSaleItemDto.total) {
      const subtotal = createSaleItemDto.unitPrice * createSaleItemDto.quantity;
      const discount = createSaleItemDto.discount || 0;
      createSaleItemDto.total = subtotal - discount;
    }

    // Diminui o estoque
    await this.inventoryService.decreaseStock(
      createSaleItemDto.itemId,
      createSaleItemDto.quantity,
    );

    const item = this.saleItemRepository.create({
      ...createSaleItemDto,
      saleId,
    });
    return await this.saleItemRepository.save(item);
  }

  async removeItem(itemId: string) {
    await this.saleItemRepository.delete(itemId);
  }

  async cancel(id: string, reason?: string) {
    const sale = await this.findOne(id);
    if (!sale) throw new Error('Sale not found');
    if (sale.status === SaleStatus.CANCELLED) throw new Error('Sale already cancelled');

    // Restaura o estoque para cada item
    for (const item of sale.items || []) {
      const inventoryItem = await this.inventoryService.findOne(item.itemId);
      if (inventoryItem) {
        const newQuantity = inventoryItem.quantity + item.quantity;
        await this.inventoryService.update(item.itemId, { quantity: newQuantity });
        await this.inventoryService.recordMovement({
          inventoryItemId: item.itemId,
          type: StockMovementType.CANCEL,
          quantity: item.quantity,
          reason: reason || 'Sale cancelled',
        });
      }
    }

    // Atualiza o status da venda
    await this.saleRepository.update(id, {
      status: SaleStatus.CANCELLED,
      cancellationReason: reason,
    });

    return await this.findOne(id);
  }

  async findByEstablishment(
    establishmentId: string,
    filters?: { limit?: number; status?: string; page?: number },
  ) {
    const query = this.saleRepository
      .createQueryBuilder('sale')
      .where('sale.establishmentId = :establishmentId', { establishmentId })
      .leftJoinAndSelect('sale.items', 'items')
      .orderBy('sale.createdAt', 'DESC');

    if (filters?.status) {
      query.andWhere('sale.status = :status', { status: filters.status });
    }

    const limit = filters?.limit || 20;
    const page = filters?.page || 1;
    const skip = (page - 1) * limit;

    query.take(limit).skip(skip);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
