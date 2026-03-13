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

  async calculateDiscount(id: string, discountPercentage: number): Promise<SaleResponseDto> {
    const sale = await this.saleRepository.findOne({ where: { id } });

    if (!sale) {
      throw new HttpException('Sale not found', HttpStatus.NOT_FOUND);
    }

    if (discountPercentage < 0 || discountPercentage > 100) {
      throw new HttpException('Discount percentage must be between 0 and 100', HttpStatus.BAD_REQUEST);
    }

    const discountAmount = (sale.totalAmount * discountPercentage) / 100;
    sale.totalAmount = sale.totalAmount - discountAmount;
    sale.discountApplied = discountPercentage;

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
      totalAmount: sale.totalAmount,
      status: sale.status,
    });
  }

  async updateSaleStatus(id: string, newStatus: SaleStatus): Promise<SaleResponseDto> {
    const sale = await this.saleRepository.findOne({ where: { id } });

    if (!sale) {
      throw new HttpException('Sale not found', HttpStatus.NOT_FOUND);
    }

    if (!this.isValidStatusTransition(sale.status, newStatus)) {
      throw new HttpException(
        `Invalid status transition from ${sale.status} to ${newStatus}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    sale.status = newStatus;
    await this.saleRepository.save(sale);

    await this.salesProducer.publishSaleUpdated({
      id: sale.id,
      customerId: sale.customerId,
      totalAmount: sale.totalAmount,
      status: sale.status,
    });

    return this.mapToDto(sale);
  }

  private isValidStatusTransition(from: SaleStatus, to: SaleStatus): boolean {
    const validTransitions: Record<SaleStatus, SaleStatus[]> = {
      [SaleStatus.PENDING]: [SaleStatus.CONFIRMED, SaleStatus.CANCELLED],
      [SaleStatus.CONFIRMED]: [SaleStatus.PROCESSING, SaleStatus.CANCELLED],
      [SaleStatus.PROCESSING]: [SaleStatus.COMPLETED, SaleStatus.FAILED],
      [SaleStatus.COMPLETED]: [SaleStatus.REFUNDED],
      [SaleStatus.FAILED]: [SaleStatus.PENDING],
      [SaleStatus.CANCELLED]: [],
      [SaleStatus.REFUNDED]: [],
    };

    return validTransitions[from]?.includes(to) ?? false;
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
