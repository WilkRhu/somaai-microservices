import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private readonly saleItemRepository: Repository<SaleItem>,
  ) {}

  async create(createSaleDto: any) {
    const sale = this.saleRepository.create(createSaleDto);
    return await this.saleRepository.save(sale);
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
    const item = this.saleItemRepository.create({
      ...createSaleItemDto,
      saleId,
    });
    return await this.saleItemRepository.save(item);
  }

  async removeItem(itemId: string) {
    await this.saleItemRepository.delete(itemId);
  }
}
