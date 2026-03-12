import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaleEntity, SaleStatus } from './entities/sale.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { SaleResponseDto } from './dto/sale-response.dto';
import { SalesProducerService } from '../kafka/sales.producer';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(SaleEntity)
    private saleRepository: Repository<SaleEntity>,
    private salesProducer: SalesProducerService,
  ) {}

  async createSale(dto: CreateSaleDto): Promise<SaleResponseDto> {
    try {
      const sale = this.saleRepository.create({
        customerId: dto.customerId,
        totalAmount: dto.totalAmount,
        items: dto.items.map((item) => ({
          ...item,
          subtotal: item.quantity * item.unitPrice,
        })),
        offerId: dto.offerId,
        status: SaleStatus.PENDING,
      });

      await this.saleRepository.save(sale);

      await this.salesProducer.publishSaleCreated({
        id: sale.id,
        customerId: sale.customerId,
        totalAmount: sale.totalAmount,
        items: sale.items,
      });

      return this.mapToDto(sale);
    } catch (error) {
      throw new HttpException(
        `Failed to create sale: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getSaleById(id: string): Promise<SaleResponseDto> {
    const sale = await this.saleRepository.findOne({ where: { id } });

    if (!sale) {
      throw new HttpException('Sale not found', HttpStatus.NOT_FOUND);
    }

    return this.mapToDto(sale);
  }

  async listSales(customerId?: string, status?: string): Promise<SaleResponseDto[]> {
    const query = this.saleRepository.createQueryBuilder('sale');

    if (customerId) {
      query.where('sale.customerId = :customerId', { customerId });
    }

    if (status) {
      query.andWhere('sale.status = :status', { status });
    }

    const sales = await query.orderBy('sale.createdAt', 'DESC').getMany();

    return sales.map((sale) => this.mapToDto(sale));
  }

  async updateSale(id: string, dto: UpdateSaleDto): Promise<SaleResponseDto> {
    const sale = await this.saleRepository.findOne({ where: { id } });

    if (!sale) {
      throw new HttpException('Sale not found', HttpStatus.NOT_FOUND);
    }

    Object.assign(sale, dto);
    await this.saleRepository.save(sale);

    await this.salesProducer.publishSaleUpdated({
      id: sale.id,
      customerId: sale.customerId,
      totalAmount: sale.totalAmount,
      status: sale.status,
    });

    return this.mapToDto(sale);
  }

  async deleteSale(id: string): Promise<void> {
    const sale = await this.saleRepository.findOne({ where: { id } });

    if (!sale) {
      throw new HttpException('Sale not found', HttpStatus.NOT_FOUND);
    }

    await this.saleRepository.remove(sale);

    await this.salesProducer.publishSaleCancelled({
      id: sale.id,
      customerId: sale.customerId,
    });
  }

  private mapToDto(sale: SaleEntity): SaleResponseDto {
    return {
      id: sale.id,
      customerId: sale.customerId,
      totalAmount: sale.totalAmount,
      status: sale.status,
      items: sale.items,
      discountApplied: sale.discountApplied,
      offerId: sale.offerId,
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
    };
  }
}
