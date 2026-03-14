import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { KafkaService } from './kafka.service';

@Injectable()
export class MonolithConsumerService implements OnModuleInit {
  private readonly logger = new Logger(MonolithConsumerService.name);

  constructor(private readonly kafkaService: KafkaService) {}

  async onModuleInit() {
    await this.subscribeToTopics();
  }

  private async subscribeToTopics() {
    try {
      this.logger.log('Starting Kafka topic subscriptions...');

      // Monolith pode escutar eventos de outras partes do sistema
      await this.kafkaService.subscribeToTopic('order.created', this.handleOrderCreated.bind(this));
      await this.kafkaService.subscribeToTopic('order.updated', this.handleOrderUpdated.bind(this));
      await this.kafkaService.subscribeToTopic('user.created', this.handleUserCreated.bind(this));
      await this.kafkaService.subscribeToTopic('user.updated', this.handleUserUpdated.bind(this));

      this.logger.log('Kafka topic subscriptions completed successfully');
    } catch (error) {
      this.logger.error(`Failed to subscribe to Kafka topics: ${error.message}`);
    }
  }

  private async handleOrderCreated(order: any) {
    this.logger.log(`Processing order created event: ${order.id}`);
    // Implementar lógica para processar criação de pedido
    // Ex: atualizar cache, sincronizar dados, etc.
  }

  private async handleOrderUpdated(order: any) {
    this.logger.log(`Processing order updated event: ${order.id}`);
    // Implementar lógica para processar atualização de pedido
  }

  private async handleUserCreated(user: any) {
    this.logger.log(`Processing user created event: ${user.id || user.email}`);
    // Implementar lógica para processar criação de usuário
  }

  private async handleUserUpdated(user: any) {
    this.logger.log(`Processing user updated event: ${user.id || user.email}`);
    // Implementar lógica para processar atualização de usuário
  }
}
