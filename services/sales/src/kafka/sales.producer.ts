import { Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';

@Injectable()
export class SalesProducerService {
  private kafka: Kafka;
  private producer: any;

  constructor() {
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'sales-service',
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

  async publishSaleCreated(data: any): Promise<void> {
    await this.producer.send({
      topic: 'sale.created',
      messages: [
        {
          key: data.id,
          value: JSON.stringify(data),
        },
      ],
    });
  }

  async publishSaleUpdated(data: any): Promise<void> {
    await this.producer.send({
      topic: 'sale.updated',
      messages: [
        {
          key: data.id,
          value: JSON.stringify(data),
        },
      ],
    });
  }

  async publishSaleCompleted(data: any): Promise<void> {
    await this.producer.send({
      topic: 'sale.completed',
      messages: [
        {
          key: data.id,
          value: JSON.stringify(data),
        },
      ],
    });
  }

  async publishSaleCancelled(data: any): Promise<void> {
    await this.producer.send({
      topic: 'sale.cancelled',
      messages: [
        {
          key: data.id,
          value: JSON.stringify(data),
        },
      ],
    });
  }
}
