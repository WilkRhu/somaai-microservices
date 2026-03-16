import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryZone } from './entities/delivery-zone.entity';
import { DeliveryOrder, DeliveryOrderStatus } from './entities/delivery-order.entity';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(DeliveryZone)
    private readonly zoneRepository: Repository<DeliveryZone>,
    @InjectRepository(DeliveryOrder)
    private readonly orderRepository: Repository<DeliveryOrder>,
  ) {}

  // Zones
  async createZone(establishmentId: string, dto: any) {
    const zone = this.zoneRepository.create({ ...dto, establishmentId });
    return this.zoneRepository.save(zone);
  }

  async findAllZones(establishmentId: string) {
    return this.zoneRepository.find({ where: { establishmentId }, order: { createdAt: 'DESC' } });
  }

  async findOneZone(id: string) {
    const zone = await this.zoneRepository.findOne({ where: { id } });
    if (!zone) throw new NotFoundException('Zona não encontrada');
    return zone;
  }

  async updateZone(id: string, dto: any) {
    await this.zoneRepository.update(id, dto);
    return this.findOneZone(id);
  }

  async removeZone(id: string) {
    await this.zoneRepository.delete(id);
    return { success: true };
  }

  // Orders
  async createOrder(establishmentId: string, dto: any) {
    const items = dto.items || [];
    const subtotal = items.reduce((sum: number, i: any) => sum + (i.subtotal ?? i.quantity * i.unitPrice), 0);

    let deliveryFee = dto.deliveryFee ?? 0;
    if (dto.zoneId) {
      const zone = await this.zoneRepository.findOne({ where: { id: dto.zoneId } });
      if (zone) {
        deliveryFee = (zone.freeDeliveryMinimum && subtotal >= Number(zone.freeDeliveryMinimum))
          ? 0
          : Number(zone.deliveryFee);
      }
    }

    const order = this.orderRepository.create({
      ...dto,
      establishmentId,
      orderNumber: `DEL-${Date.now()}`,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
    });
    return this.orderRepository.save(order);
  }

  async findAllOrders(establishmentId: string, filters?: { status?: string; page?: number; limit?: number }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;

    const query = this.orderRepository.createQueryBuilder('order')
      .where('order.establishmentId = :establishmentId', { establishmentId })
      .orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filters?.status) {
      query.andWhere('order.status = :status', { status: filters.status });
    }

    const [data, total] = await query.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOneOrder(id: string) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Pedido não encontrado');
    return order;
  }

  async updateOrderStatus(id: string, dto: { status: string; notes?: string }) {
    await this.findOneOrder(id);
    const updates: any = { status: dto.status };
    if (dto.notes !== undefined) updates.notes = dto.notes;
    if (dto.status === DeliveryOrderStatus.DELIVERED) updates.deliveredAt = new Date();
    await this.orderRepository.update(id, updates);
    return this.findOneOrder(id);
  }

  async updateOrder(id: string, dto: any) {
    await this.orderRepository.update(id, dto);
    return this.findOneOrder(id);
  }

  async removeOrder(id: string) {
    await this.orderRepository.delete(id);
    return { success: true };
  }
}
