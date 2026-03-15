import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka!: Kafka;
  private producer!: Producer;
  private consumer!: Consumer;
  private readonly logger = new Logger(KafkaService.name);
  private topicCallbacks: Map<string, (message: any) => Promise<void>> = new Map();
  private isInitialized = false;
  private initializationPromise: Promise<void>;
  private isConsumerRunning = false;

  constructor() {
    this.initializationPromise = this.initialize();
  }

  async onModuleInit() {
    await this.initializationPromise;
  }

  private async initialize() {
    const maxRetries = 5;
    const retryDelay = 5000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`Attempting to initialize Kafka service (attempt ${attempt}/${maxRetries})...`);

        this.kafka = new Kafka({
          clientId: 'notifications-service',
          brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
          connectionTimeout: 10000,
          requestTimeout: 30000,
          retry: {
            initialRetryTime: 100,
            retries: 8,
          },
        });

        this.producer = this.kafka.producer({
          createPartitioner: () => {
            const { Partitioners } = require('kafkajs');
            return Partitioners.LegacyPartitioner;
          },
        });

        this.consumer = this.kafka.consumer({
          groupId: process.env.KAFKA_GROUP_ID || 'notifications-group',
          sessionTimeout: 30000,
          heartbeatInterval: 3000,
          maxWaitTimeInMs: 5000,
        });

        await this.producer.connect();
        this.logger.log('Kafka producer connected successfully');

        await this.consumer.connect();
        this.logger.log('Kafka consumer connected successfully');

        this.isInitialized = true;
        this.logger.log('Kafka service initialized successfully');
        return;
      } catch (error) {
        this.logger.error(`Kafka initialization attempt ${attempt} failed: ${error instanceof Error ? error.message : String(error)}`);

        if (attempt === maxRetries) {
          this.logger.error(`All ${maxRetries} Kafka initialization attempts failed.`);
          this.isInitialized = false;
          return;
        }

        this.logger.log(`Waiting ${retryDelay / 1000} seconds before next attempt...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  async onModuleDestroy() {
    if (this.producer) {
      await this.producer.disconnect();
    }
    if (this.consumer) {
      await this.consumer.disconnect();
    }
  }

  async publishEvent(topic: string, message: any): Promise<void> {
    if (!this.isInitialized) {
      this.logger.warn(`Kafka not initialized, skipping publish to ${topic}`);
      return;
    }

    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: message.userId || 'default',
            value: JSON.stringify(message),
          },
        ],
      });
      this.logger.log(`Event published to topic ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to publish event to ${topic}:`, error);
    }
  }

  async subscribeToTopic(topic: string, callback: (message: any) => Promise<void>): Promise<void> {
    if (!this.isInitialized) {
      this.logger.warn(`Kafka not initialized, skipping subscription to ${topic}`);
      return;
    }

    try {
      await this.consumer.subscribe({ topic });
      this.topicCallbacks.set(topic, callback);
      this.logger.log(`Subscribed to topic ${topic}`);

      // Only run consumer once
      if (!this.isConsumerRunning) {
        this.isConsumerRunning = true;
        await this.consumer.run({
          eachMessage: async ({ topic, partition, message }) => {
            try {
              const parsedMessage = JSON.parse(message.value?.toString() || '{}');
              const callback = this.topicCallbacks.get(topic);
              if (callback) {
                await callback(parsedMessage);
              }
            } catch (error) {
              this.logger.error(`Error processing message from ${topic}:`, error);
            }
          },
        });
      }
    } catch (error) {
      this.logger.error(`Failed to subscribe to topic ${topic}:`, error);
    }
  }
}
