import { Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';

@Injectable()
export class OffersProducerService {
  private kafka: Kafka;
  private producer: any;

  constructor() {
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'offers-service',
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

  async publishOfferCreated(data: any): Promise<void> {
    await this.producer.send({
      topic: 'offer.created',
      messages: [
        {
          key: data.id,
          value: JSON.stringify(data),
        },
      ],
    });
  }

  async publishOfferUpdated(data: any): Promise<void> {
    await this.producer.send({
      topic: 'offer.updated',
      messages: [
        {
          key: data.id,
          value: JSON.stringify(data),
        },
      ],
    });
  }

  async publishOfferDeleted(data: any): Promise<void> {
    await this.producer.send({
      topic: 'offer.deleted',
      messages: [
        {
          key: data.id,
          value: JSON.stringify(data),
        },
      ],
    });
  }
}
