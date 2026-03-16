import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private kafka: Kafka;
  private producer: Producer;

  async onModuleInit() {
    try {
      const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
      
      this.kafka = new Kafka({
        clientId: process.env.KAFKA_CLIENT_ID || 'business-service',
        brokers,
      });

      this.producer = this.kafka.producer();
      await this.producer.connect();
      this.logger.log('Kafka Producer connected');
    } catch (error) {
      this.logger.error(`Failed to initialize Kafka Producer: ${error.message}`, error.stack);
    }
  }

  async onModuleDestroy() {
    if (this.producer) {
      await this.producer.disconnect();
      this.logger.log('Kafka Producer disconnected');
    }
  }

  async publishEvent(topic: string, message: any) {
    try {
      if (!this.producer) {
        this.logger.warn('Producer not initialized, skipping message publish');
        return;
      }

      await this.producer.send({
        topic,
        messages: [
          {
            value: JSON.stringify(message),
          },
        ],
      });

      this.logger.log(`Event published to topic ${topic}: ${JSON.stringify(message)}`);
    } catch (error) {
      this.logger.error(`Failed to publish event to topic ${topic}: ${error.message}`, error.stack);
    }
  }
}
