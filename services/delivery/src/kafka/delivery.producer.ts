import { Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';

@Injectable()
export class DeliveryProducerService {
  private kafka: Kafka;
  private producer: any;

  constructor() {
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'delivery-service',
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

  async publishDeliveryCreated(data: any): Promise<void> {
    await this.producer.send({
      topic: 'delivery.created',
      messages: [
        {
          key: data.id,
          value: JSON.stringify(data),
        },
      ],
    });
  }

  async publishDeliveryUpdated(data: any): Promise<void> {
    await this.producer.send({
      topic: 'delivery.updated',
      messages: [
        {
          key: data.id,
          value: JSON.stringify(data),
        },
      ],
    });
  }

  async publishDeliveryCompleted(data: any): Promise<void> {
    await this.producer.send({
      topic: 'delivery.completed',
      messages: [
        {
          key: data.id,
          value: JSON.stringify(data),
        },
      ],
    });
  }
}
