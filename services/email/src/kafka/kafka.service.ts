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

  constructor() {
    this.initializationPromise = this.initialize();
  }

  async onModuleInit() {
    await this.initializationPromise;
  }

  private async initialize() {
    const maxRetries = 5;
    const retryDelay = 5000; // 5 segundos
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`Attempting to initialize Kafka service (attempt ${attempt}/${maxRetries})...`);
        
        this.kafka = new Kafka({
          clientId: 'email-service',
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
          }
        });
        
        this.consumer = this.kafka.consumer({
          groupId: process.env.KAFKA_GROUP_ID || 'email-service-group',
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
          this.logger.error(`All ${maxRetries} Kafka initialization attempts failed. Service will continue without Kafka.`);
          this.isInitialized = false;
          return;
        }
        
        this.logger.log(`Waiting ${retryDelay / 1000} seconds before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  async onModuleDestroy() {
    if (this.producer) await this.producer.disconnect();
    if (this.consumer) await this.consumer.disconnect();
    this.logger.log('Kafka service disconnected');
  }

  async publishEvent(topic: string, message: any) {
    if (!this.isInitialized) {
      await this.initializationPromise;
    }
    
    if (!this.isInitialized) {
      this.logger.warn(`Cannot publish event to topic ${topic}: Kafka service not initialized`);
      return;
    }
    
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: message.id || message.userId || Date.now().toString(),
            value: JSON.stringify(message),
          },
        ],
      });
      this.logger.log(`Published event to topic ${topic}: ${JSON.stringify(message)}`);
    } catch (error) {
      this.logger.error(`Error publishing event to topic ${topic}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private isConsumerRunning = false;
  private subscriptionPromise: Promise<void> | null = null;

  async subscribeToTopic(topic: string, callback: (message: any) => Promise<void>) {
    if (!this.isInitialized) {
      await this.initializationPromise;
    }
    
    this.topicCallbacks.set(topic, callback);
    
    try {
      await this.consumer.subscribe({ topic, fromBeginning: false });
      this.logger.log(`Subscribed to topic: ${topic}`);
      
      if (!this.isConsumerRunning) {
        if (!this.subscriptionPromise) {
          this.subscriptionPromise = this.startConsumer();
        }
        await this.subscriptionPromise;
      }
    } catch (error) {
      this.logger.error(`Error subscribing to topic ${topic}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  private async startConsumer() {
    if (this.isConsumerRunning) return;

    try {
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }: any) => {
          try {
            const data = JSON.parse(message.value.toString());
            this.logger.log(`Received message from topic ${topic}, partition ${partition}`);
            
            const callback = this.topicCallbacks.get(topic);
            if (callback) {
              await callback(data);
            } else {
              this.logger.warn(`No callback registered for topic: ${topic}`);
            }
          } catch (error) {
            this.logger.error(`Error processing message from topic ${topic}: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
      });

      this.isConsumerRunning = true;
      this.logger.log('Kafka consumer started');
    } catch (error) {
      this.logger.error(`Error starting consumer: ${error instanceof Error ? error.message : String(error)}`);
      this.subscriptionPromise = null;
      throw error;
    }
  }
}
