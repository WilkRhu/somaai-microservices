import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class FiscalProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;

  constructor() {
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'fiscal-service',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
    console.log('Fiscal Kafka Producer connected');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async publishNfceIssued(data: any): Promise<void> {
    await this.producer.send({
      topic: 'fiscal.nfce.issued',
      messages: [
        {
          key: data.id,
          value: JSON.stringify(data),
        },
      ],
    });
  }

  async publishNfceFailed(data: any): Promise<void> {
    await this.producer.send({
      topic: 'fiscal.nfce.failed',
      messages: [
        {
          key: `${data.establishmentId}-${data.number}`,
          value: JSON.stringify(data),
        },
      ],
    });
  }
}
