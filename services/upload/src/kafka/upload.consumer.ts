import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer } from 'kafkajs';

@Injectable()
export class UploadConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka!: Kafka;
  private consumer!: Consumer;
  private readonly logger = new Logger(UploadConsumerService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      const brokers = (this.configService.get('KAFKA_BROKERS') || 'localhost:9092').split(',');
      
      this.kafka = new Kafka({
        clientId: 'upload-service',
        brokers,
      });

      this.consumer = this.kafka.consumer({
        groupId: this.configService.get('KAFKA_GROUP_ID') || 'upload-group',
      });

      await this.consumer.connect();
      this.logger.log('Connected to Kafka');
      
      await this.subscribeToTopics();
    } catch (error) {
      this.logger.error(`Failed to initialize Kafka consumer: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async onModuleDestroy() {
    try {
      await this.consumer.disconnect();
      this.logger.log('Disconnected from Kafka');
    } catch (error) {
      this.logger.error(`Error disconnecting from Kafka: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async subscribeToTopics() {
    try {
      await this.consumer.subscribe({ topic: 'file.upload.requested' });

      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }: any) => {
          try {
            const data = JSON.parse(message.value?.toString() || '{}');
            this.logger.log(`Received message from topic ${topic}: ${JSON.stringify(data)}`);

            if (topic === 'file.upload.requested') {
              await this.handleUploadRequested(data);
            }
          } catch (error) {
            this.logger.error(`Error processing message: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
      });
    } catch (error) {
      this.logger.error(`Error subscribing to topics: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async handleUploadRequested(data: any) {
    this.logger.log(`Processing upload request: ${JSON.stringify(data)}`);
    // Aqui você implementaria a lógica de processar upload
  }
}
