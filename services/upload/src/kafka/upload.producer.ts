import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class UploadProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka!: Kafka;
  private producer!: Producer;
  private readonly logger = new Logger(UploadProducerService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      const brokers = (this.configService.get('KAFKA_BROKERS') || 'localhost:9092').split(',');
      
      this.kafka = new Kafka({
        clientId: 'upload-service',
        brokers,
      });

      this.producer = this.kafka.producer();
      await this.producer.connect();
      this.logger.log('Kafka producer connected');
    } catch (error) {
      this.logger.error(`Failed to initialize Kafka producer: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
      this.logger.log('Kafka producer disconnected');
    } catch (error) {
      this.logger.error(`Error disconnecting producer: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async publishUploadCompleted(data: any) {
    try {
      await this.producer.send({
        topic: 'file.upload.completed',
        messages: [
          {
            key: data.fileId || 'unknown',
            value: JSON.stringify(data),
          },
        ],
      });
      this.logger.log(`Published upload.completed event: ${JSON.stringify(data)}`);
    } catch (error) {
      this.logger.error(`Error publishing upload.completed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async publishUploadFailed(data: any) {
    try {
      await this.producer.send({
        topic: 'file.upload.failed',
        messages: [
          {
            key: data.fileId || 'unknown',
            value: JSON.stringify(data),
          },
        ],
      });
      this.logger.log(`Published upload.failed event: ${JSON.stringify(data)}`);
    } catch (error) {
      this.logger.error(`Error publishing upload.failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
