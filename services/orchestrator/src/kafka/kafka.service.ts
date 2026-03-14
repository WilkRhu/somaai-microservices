import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private readonly logger = new Logger(KafkaService.name);
  private topicCallbacks: Map<string, (message: any) => Promise<void>> = new Map();
  private isConsumerRunning = false;
  private subscriptionPromise: Promise<void> | null = null;

  async onModuleInit() {
    this.kafka = new Kafka({
      clientId: 'orchestrator-service',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
      connectionTimeout: 10000,
      requestTimeout: 30000,
    });

    this.producer = this.kafka.producer({
      createPartitioner: () => {
        const { Partitioners } = require('kafkajs');
        return Partitioners.LegacyPartitioner;
      }
    });
    
    this.consumer = this.kafka.consumer({
      groupId: process.env.KAFKA_GROUP_ID || 'orchestrator-group',
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });

    await this.producer.connect();
    await this.consumer.connect();
    this.logger.log('Kafka service initialized');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }

  async publishEvent(topic: string, message: any) {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: message.id || Date.now().toString(),
            value: JSON.stringify(message),
          },
        ],
      });
      this.logger.log(`Published event to topic ${topic}`);
    } catch (error) {
      this.logger.error(`Error publishing event to topic ${topic}: ${error.message}`);
    }
  }

  async subscribeToTopic(topic: string, callback: (message: any) => Promise<void>) {
    this.topicCallbacks.set(topic, callback);
    
    try {
      await this.consumer.subscribe({ topic, fromBeginning: true });
      this.logger.log(`Subscribed to topic: ${topic}`);
      
      if (!this.isConsumerRunning) {
        if (!this.subscriptionPromise) {
          this.subscriptionPromise = this.startConsumer();
        }
        await this.subscriptionPromise;
      }
    } catch (error) {
      this.logger.error(`Error subscribing to topic ${topic}: ${error.message}`);
      throw error;
    }
  }

  private async startConsumer() {
    if (this.isConsumerRunning) return;

    try {
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const data = JSON.parse(message.value.toString());
            this.logger.log(`Received message from topic ${topic}`);
            
            const callback = this.topicCallbacks.get(topic);
            if (callback) {
              await callback(data);
            }
          } catch (error) {
            this.logger.error(`Error processing message from topic ${topic}: ${error.message}`);
          }
        },
      });

      this.isConsumerRunning = true;
      this.logger.log('Kafka consumer started');
    } catch (error) {
      this.logger.error(`Error starting consumer: ${error.message}`);
      this.subscriptionPromise = null;
      throw error;
    }
  }
}
