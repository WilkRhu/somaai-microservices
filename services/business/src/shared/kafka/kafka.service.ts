import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { BusinessConsumer } from './business.consumer';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(private businessConsumer: BusinessConsumer) {}

  async onModuleInit() {
    try {
      const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
      this.logger.log(`🔗 Connecting to Kafka brokers: ${brokers.join(', ')}`);
      
      this.kafka = new Kafka({
        clientId: process.env.KAFKA_CLIENT_ID || 'business-service',
        brokers,
        connectionTimeout: 10000,
        requestTimeout: 30000,
      });

      this.consumer = this.kafka.consumer({
        groupId: process.env.KAFKA_GROUP_ID || 'business-group',
        sessionTimeout: 30000,
        heartbeatInterval: 3000,
      });

      await this.consumer.connect();
      this.logger.log('✅ Connected to Kafka');

      // Subscribe to user events
      await this.consumer.subscribe({ 
        topics: ['user.created', 'user.updated'], 
        fromBeginning: true 
      });
      this.logger.log('✅ Subscribed to user.created and user.updated topics (fromBeginning: true)');

      // Start consuming messages in background (don't await)
      this.consumer.run({
        eachMessage: this.handleMessage.bind(this),
      }).catch((error) => {
        this.logger.error(`❌ Kafka consumer error: ${error.message}`, error.stack);
      });
      
      this.logger.log('✅ Kafka consumer started');
    } catch (error) {
      this.logger.error(`❌ Failed to initialize Kafka: ${error.message}`, error.stack);
      // Don't throw - allow the service to start even if Kafka fails
    }
  }

  private async handleMessage(payload: EachMessagePayload) {
    try {
      const { topic, partition, message } = payload;
      
      this.logger.log(`📨 [KAFKA] Received message from topic: ${topic}, partition: ${partition}`);

      if (!message.value) {
        this.logger.warn('Received empty message');
        return;
      }

      const messageValue = JSON.parse(message.value.toString());
      this.logger.log(`📨 [KAFKA] Message content: ${JSON.stringify(messageValue)}`);

      if (topic === 'user.created') {
        this.logger.log(`🎯 [USER.CREATED] Handling user.created event`);
        await this.businessConsumer.handleUserCreated(messageValue);
      } else if (topic === 'user.updated') {
        this.logger.log(`🔄 [USER.UPDATED] Handling user.updated event`);
        await this.businessConsumer.handleUserUpdated(messageValue);
      }
    } catch (error) {
      this.logger.error(`Error processing Kafka message: ${error.message}`, error.stack);
      // Don't throw - we don't want to fail the consumer
    }
  }

  async onModuleDestroy() {
    try {
      if (this.consumer) {
        await this.consumer.disconnect();
        this.logger.log('Disconnected from Kafka');
      }
    } catch (error) {
      this.logger.error(`Error disconnecting from Kafka: ${error.message}`);
    }
  }
}
