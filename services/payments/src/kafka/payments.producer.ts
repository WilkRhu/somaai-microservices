import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class PaymentsProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka!: Kafka;
  private producer!: Producer;

  constructor() {
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'payments-service',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
    console.log('Payments Kafka Producer connected');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async publishPaymentCompleted(data: any): Promise<void> {
    await this.producer.send({
      topic: 'payment.completed',
      messages: [
        {
          key: data.orderId,
          value: JSON.stringify(data),
        },
      ],
    });
  }

  async publishPaymentFailed(data: any): Promise<void> {
    await this.producer.send({
      topic: 'payment.failed',
      messages: [
        {
          key: data.orderId,
          value: JSON.stringify(data),
        },
      ],
    });
  }

  async publishPaymentInitiated(data: any): Promise<void> {
    await this.producer.send({
      topic: 'payment.initiated',
      messages: [
        {
          key: data.orderId,
          value: JSON.stringify(data),
        },
      ],
    });
  }
}
