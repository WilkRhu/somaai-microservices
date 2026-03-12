import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryEntity, DeliveryStatus } from './entities/delivery.entity';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { DeliveryResponseDto } from './dto/delivery-response.dto';
import { DeliveryProducerService } from '../kafka/delivery.producer';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(DeliveryEntity)
    private deliveryRepository: Repository<DeliveryEntity>,
    private deliveryProducer: DeliveryProducerService,
  ) {}

  async createDelivery(dto: CreateDeliveryDto): Promise<DeliveryResponseDto> {
    try {
      const delivery = this.deliveryRepository.create({
        saleId: dto.saleId,
        trackingCode: `TRACK-${uuidv4().substring(0, 8).toUpperCase()}`,
        estimatedDate: new Date(dto.estimatedDate),
        status: DeliveryStatus.PENDING,
      });

      await this.deliveryRepository.save(delivery);

      await this.deliveryProducer.publishDeliveryCreated({
        id: delivery.id,
        saleId: delivery.saleId,
        trackingCode: delivery.trackingCode,
      });

      return this.mapToDto(delivery);
    } catch (error) {
      throw new HttpException(
        `Failed to create delivery: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getDeliveryById(id: string): Promise<DeliveryResponseDto> {
    const delivery = await this.deliveryRepository.findOne({ where: { id } });

    if (!delivery) {
      throw new HttpException('Delivery not found', HttpStatus.NOT_FOUND);
    }

    return this.mapToDto(delivery);
  }

  async listDeliveries(saleId?: string, status?: string): Promise<DeliveryResponseDto[]> {
    const query = this.deliveryRepository.createQueryBuilder('delivery');

    if (saleId) {
      query.where('delivery.saleId = :saleId', { saleId });
    }

    if (status) {
      query.andWhere('delivery.status = :status', { status });
    }

    const deliveries = await query.orderBy('delivery.createdAt', 'DESC').getMany();

    return deliveries.map((delivery) => this.mapToDto(delivery));
  }

  async updateDelivery(id: string, dto: UpdateDeliveryDto): Promise<DeliveryResponseDto> {
    const delivery = await this.deliveryRepository.findOne({ where: { id } });

    if (!delivery) {
      throw new HttpException('Delivery not found', HttpStatus.NOT_FOUND);
    }

    Object.assign(delivery, dto);
    await this.deliveryRepository.save(delivery);

    await this.deliveryProducer.publishDeliveryUpdated({
      id: delivery.id,
      saleId: delivery.saleId,
      status: delivery.status,
    });

    if (delivery.status === DeliveryStatus.DELIVERED) {
      await this.deliveryProducer.publishDeliveryCompleted({
        id: delivery.id,
        saleId: delivery.saleId,
        trackingCode: delivery.trackingCode,
      });
    }

    return this.mapToDto(delivery);
  }

  async trackDelivery(id: string): Promise<DeliveryResponseDto> {
    const delivery = await this.deliveryRepository.findOne({ where: { id } });

    if (!delivery) {
      throw new HttpException('Delivery not found', HttpStatus.NOT_FOUND);
    }

    return this.mapToDto(delivery);
  }

  private mapToDto(delivery: DeliveryEntity): DeliveryResponseDto {
    return {
      id: delivery.id,
      saleId: delivery.saleId,
      status: delivery.status,
      trackingCode: delivery.trackingCode,
      estimatedDate: delivery.estimatedDate,
      actualDate: delivery.actualDate,
      createdAt: delivery.createdAt,
      updatedAt: delivery.updatedAt,
    };
  }
}
