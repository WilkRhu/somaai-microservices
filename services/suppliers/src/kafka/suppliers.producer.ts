import { Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';

@Injectable()
export class SuppliersProducerService {
  private kafka: Kafka;
  private producer: any;

  constructor() {
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'suppliers-service',
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

  async publishSupplierCreated(data: any): Promise<void> {
    await this.producer.send({
      topic: 'supplier.created',
      messages: [
        {
          key: data.id,
          value: JSON.stringify(data),
        },
      ],
    });
  }

  async publishSupplierUpdated(data: any): Promise<void> {
    await this.producer.send({
      topic: 'supplier.updated',
      messages: [
        {
          key: data.id,
          value: JSON.stringify(data),
        },
      ],
    });
  }

  async publishSupplierDeleted(data: any): Promise<void> {
    await this.producer.send({
      topic: 'supplier.deleted',
      messages: [
        {
          key: data.id,
          value: JSON.stringify(data),
        },
      ],
    });
  }
}
