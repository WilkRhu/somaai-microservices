import { Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';

@Injectable()
export class InventoryProducerService {
  private kafka: Kafka;
  private producer: any;

  constructor() {
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'inventory-service',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async publishInventoryUpdated(data: any): Promise<void> {
    await this.producer.send({
      topic: 'inventory.updated',
      messages: [
        {
          key: data.id,
          value: JSON.stringify(data),
        },
      ],
    });
  }

  async publishLowStockAlert(data: any): Promise<void> {
    await this.producer.send({
      topic: 'inventory.low_stock_alert',
      messages: [
        {
          key: data.id,
          value: JSON.stringify(data),
        },
      ],
    });
  }

  async publishRestocked(data: any): Promise<void> {
    await this.producer.send({
      topic: 'inventory.restocked',
      messages: [
        {
          key: data.id,
          value: JSON.stringify(data),
        },
      ],
    });
  }
}
