import { Injectable } from '@nestjs/common';
import { KafkaService } from '../kafka/kafka.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private kafkaService: KafkaService) {}

  async createOrder(createOrderDto: CreateOrderDto) {
    const orderId = `order-${Date.now()}`;

    const order = {
      id: orderId,
      ...createOrderDto,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Publicar evento de ordem criada
    await this.kafkaService.publishEvent('order.created', order);

    return {
      id: orderId,
      message: 'Order created and sent to processing',
      status: 'pending',
    };
  }

  async getOrderStatus(orderId: string) {
    return {
      id: orderId,
      status: 'processing',
      message: 'Order is being processed',
    };
  }
}
