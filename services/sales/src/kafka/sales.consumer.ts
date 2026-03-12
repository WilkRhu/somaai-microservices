import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';

@Injectable()
export class SalesConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;
  private readonly logger = new Logger(SalesConsumerService.name);

  async onModuleInit() {
    this.kafka = new Kafka({
      clientId: 'sales-service',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    });

    this.consumer = this.kafka.consumer({
      groupId: process.env.KAFKA_GROUP_ID || 'sales-group',
    });

    await this.consumer.connect();
    await this.subscribeToTopics();
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }

  private async subscribeToTopics() {
    await this.consumer.subscribe({ topic: 'order.created' });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const data = JSON.parse(message.value.toString());
          this.logger.log(`Received message from topic ${topic}: ${JSON.stringify(data)}`);

          if (topic === 'order.created') {
            await this.handleOrderCreated(data);
          }
        } catch (error) {
          this.logger.error(`Error processing message: ${error.message}`);
        }
      },
    });
  }

  private async handleOrderCreated(order: any) {
    this.logger.log(`Processing order: ${order.id}`);
    // Aqui você implementaria a lógica de criar a venda
    // Por enquanto, apenas logamos
  }
}
