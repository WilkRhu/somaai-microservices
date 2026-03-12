import { Injectable, Logger } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class OcrProducerService {
  private producer: Producer;
  private readonly logger = new Logger(OcrProducerService.name);

  constructor() {
    const kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'ocr-service',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    });

    this.producer = kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
    this.logger.log('Kafka producer connected');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    this.logger.log('Kafka producer disconnected');
  }

  async publishProcessingCompleted(data: any): Promise<void> {
    try {
      await this.producer.send({
        topic: 'ocr.processing.completed',
        messages: [
          {
            key: data.processingId,
            value: JSON.stringify(data),
          },
        ],
      });

      this.logger.log(`Published ocr.processing.completed event for ${data.processingId}`);
    } catch (error) {
      this.logger.error(`Error publishing event: ${error.message}`);
      throw error;
    }
  }

  async publishProcessingFailed(data: any): Promise<void> {
    try {
      await this.producer.send({
        topic: 'ocr.processing.failed',
        messages: [
          {
            key: data.processingId,
            value: JSON.stringify(data),
          },
        ],
      });

      this.logger.log(`Published ocr.processing.failed event for ${data.processingId}`);
    } catch (error) {
      this.logger.error(`Error publishing event: ${error.message}`);
      throw error;
    }
  }
}
