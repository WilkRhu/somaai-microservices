import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { UserSyncService } from '../users/services/user-sync.service';

@Injectable()
export class MonolithConsumerService implements OnModuleInit {
  private readonly logger = new Logger(MonolithConsumerService.name);

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly userSyncService: UserSyncService,
  ) {}

  async onModuleInit() {
    this.logger.log('🚀 MonolithConsumerService initializing...');
    await this.subscribeToTopics();
  }

  private async subscribeToTopics() {
    try {
      this.logger.log('📡 Starting Kafka topic subscriptions...');

      // Monolith pode escutar eventos de outras partes do sistema
      await this.kafkaService.subscribeToTopic('order.created', this.handleOrderCreated.bind(this));
      this.logger.log('✅ Subscribed to order.created');
      
      await this.kafkaService.subscribeToTopic('order.updated', this.handleOrderUpdated.bind(this));
      this.logger.log('✅ Subscribed to order.updated');
      
      await this.kafkaService.subscribeToTopic('user.created', this.handleUserCreated.bind(this));
      this.logger.log('✅ Subscribed to user.created');
      
      await this.kafkaService.subscribeToTopic('user.updated', this.handleUserUpdated.bind(this));
      this.logger.log('✅ Subscribed to user.updated');

      this.logger.log('✅ Kafka topic subscriptions completed successfully');
    } catch (error) {
      this.logger.error(`❌ Failed to subscribe to Kafka topics: ${error.message}`);
    }
  }

  private async handleOrderCreated(order: any) {
    this.logger.log(`📦 Processing order created event: ${order.id}`);
    // Implementar lógica para processar criação de pedido
    // Ex: atualizar cache, sincronizar dados, etc.
  }

  private async handleOrderUpdated(order: any) {
    this.logger.log(`📦 Processing order updated event: ${order.id}`);
    // Implementar lógica para processar atualização de pedido
  }

  private async handleUserCreated(user: any) {
    try {
      this.logger.log(`👤 Processing user created event: ${user.id || user.email}`);
      this.logger.log(`   - User data:`, JSON.stringify(user));
      
      // Sincronizar usuário do auth para o monolith
      const syncedUser = await this.userSyncService.syncUserFromAuth({
        id: user.id,
        email: user.email,
        firstName: user.firstName || 'User',
        lastName: user.lastName || user.id?.substring(0, 8) || '',
        phone: user.phone,
        avatar: user.avatar,
        authProvider: user.authProvider || 'EMAIL',
        role: user.role || 'USER',
        emailVerified: user.emailVerified || false,
      });

      this.logger.log(`✅ User ${user.id} successfully synced to monolith`);
      this.logger.log(`   - Email: ${syncedUser.email}`);
      this.logger.log(`   - Name: ${syncedUser.firstName} ${syncedUser.lastName}`);
    } catch (error) {
      this.logger.error(`❌ Error syncing user ${user.id}: ${error.message}`);
      this.logger.error(`   - Stack:`, error.stack);
    }
  }

  private async handleUserUpdated(user: any) {
    try {
      this.logger.log(`👤 Processing user updated event: ${user.id || user.email}`);
      
      // Sincronizar atualização de usuário
      const syncedUser = await this.userSyncService.syncUserFromAuth({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar,
        authProvider: user.authProvider,
        role: user.role,
        emailVerified: user.emailVerified,
      });

      this.logger.log(`✅ User ${user.id} successfully updated in monolith`);
    } catch (error) {
      this.logger.error(`❌ Error updating user ${user.id}: ${error.message}`);
    }
  }
}
