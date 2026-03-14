import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { KafkaService } from './kafka.service';

@Injectable()
export class AuthConsumerService implements OnModuleInit {
  private readonly logger = new Logger(AuthConsumerService.name);

  constructor(private readonly kafkaService: KafkaService) {}

  async onModuleInit() {
    await this.subscribeToTopics();
  }

  private async subscribeToTopics() {
    try {
      this.logger.log('Starting Kafka topic subscriptions...');
      
      // O auth service pode escutar eventos relacionados a usuários
      await this.kafkaService.subscribeToTopic('user.created', this.handleUserCreated.bind(this));
      await this.kafkaService.subscribeToTopic('user.updated', this.handleUserUpdated.bind(this));
      await this.kafkaService.subscribeToTopic('user.deleted', this.handleUserDeleted.bind(this));
      await this.kafkaService.subscribeToTopic('auth.token.revoked', this.handleTokenRevoked.bind(this));
      
      // Também pode escutar eventos de ordem para sincronização
      await this.kafkaService.subscribeToTopic('order.created', this.handleOrderCreated.bind(this));
      
      this.logger.log('Kafka topic subscriptions completed successfully');
    } catch (error) {
      this.logger.error(`Failed to subscribe to Kafka topics: ${error.message}`);
      // Não lançar erro para não quebrar a inicialização do serviço
      // O serviço pode continuar funcionando sem Kafka
    }
  }

  private async handleUserCreated(user: any) {
    this.logger.log(`Processing user created event for user: ${user.id || user.email}`);
    // Aqui você implementaria a lógica para processar criação de usuário
    // Ex: sincronizar com cache, atualizar índices, etc.
  }

  private async handleUserUpdated(user: any) {
    this.logger.log(`Processing user updated event for user: ${user.id || user.email}`);
    // Aqui você implementaria a lógica para processar atualização de usuário
    // Ex: invalidar cache, atualizar sessões, etc.
  }

  private async handleUserDeleted(user: any) {
    this.logger.log(`Processing user deleted event for user: ${user.id || user.email}`);
    // Aqui você implementaria a lógica para processar exclusão de usuário
    // Ex: revogar tokens, limpar cache, etc.
  }

  private async handleTokenRevoked(tokenData: any) {
    this.logger.log(`Processing token revoked event: ${JSON.stringify(tokenData)}`);
    // Aqui você implementaria a lógica para revogação de token
    // Ex: adicionar à blacklist, invalidar sessões, etc.
  }

  private async handleOrderCreated(order: any) {
    this.logger.log(`Processing order created event: ${order.id}`);
    // O auth service pode usar eventos de ordem para analytics ou auditoria
    // Ex: registrar atividade do usuário, atualizar estatísticas, etc.
  }
}