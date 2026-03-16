import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { NotificationsService } from '../notifications.service';
import { KafkaService } from '../../kafka/kafka.service';
import { NotificationType } from '../enums/notification-type.enum';

@Injectable()
export class NotificationConsumer implements OnModuleInit {
  private readonly logger = new Logger(NotificationConsumer.name);

  constructor(
    private kafkaService: KafkaService,
    private notificationsService: NotificationsService,
  ) {}

  async onModuleInit() {
    try {
      // Subscribe to all topics first, then start consumer
      const topics = ['notification.send', 'notification.email.send', 'auth.registration.success', 'order.created', 'user.created'];
      
      this.logger.log(`🔗 Subscribing to ${topics.length} topics...`);
      
      // Subscribe to all topics
      await this.kafkaService.subscribeToTopic(
        'notification.send',
        this.handleNotificationSend.bind(this),
      );
      this.logger.log('✅ Registered consumer for notification.send topic');

      await this.kafkaService.subscribeToTopic(
        'notification.email.send',
        this.handleEmailSend.bind(this),
      );
      this.logger.log('✅ Registered consumer for notification.email.send topic');

      // Subscribe to other topics with error handling
      try {
        await this.kafkaService.subscribeToTopic(
          'auth.registration.success',
          this.handleRegistrationSuccess.bind(this),
        );
        this.logger.log('✅ Registered consumer for auth.registration.success topic');
      } catch (error) {
        this.logger.warn(`⚠️ Could not subscribe to auth.registration.success: ${error instanceof Error ? error.message : String(error)}`);
      }

      try {
        await this.kafkaService.subscribeToTopic(
          'order.created',
          this.handleOrderCreated.bind(this),
        );
        this.logger.log('✅ Registered consumer for order.created topic');
      } catch (error) {
        this.logger.warn(`⚠️ Could not subscribe to order.created: ${error instanceof Error ? error.message : String(error)}`);
      }

      try {
        await this.kafkaService.subscribeToTopic(
          'user.created',
          this.handleUserCreated.bind(this),
        );
        this.logger.log('✅ Registered consumer for user.created topic');
      } catch (error) {
        this.logger.warn(`⚠️ Could not subscribe to user.created: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      this.logger.log('✅ All Kafka consumers registered successfully');
    } catch (error) {
      this.logger.error(
        `❌ Failed to register Kafka consumers: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async handleNotificationSend(message: any) {
    try {
      const { userId, type, title, message: body, recipient, metadata } = message;
      this.logger.log(`Processing notification.send event: type=${type} userId=${userId}`);

      await this.notificationsService.sendNotification({
        userId,
        type: (type as string).toLowerCase() as NotificationType,
        title,
        message: body,
        recipient,
        metadata,
      });
    } catch (error) {
      this.logger.error(`Error handling notification.send:`, error);
    }
  }

  private async handleEmailSend(message: any) {
    try {
      const { userId, to, subject, template, data } = message;
      this.logger.log(`📧 [EMAIL.SEND] Processing notification.email.send event: to=${to} template=${template}`);

      // Build email body based on template
      let emailBody = '';
      if (template === 'welcome') {
        const { firstName, lastName } = data;
        emailBody = `<h1>Bem-vindo ao SomaAI, ${firstName}!</h1><p>Sua conta foi criada com sucesso. Estamos felizes em tê-lo conosco.</p>`;
      } else {
        emailBody = `<p>${subject}</p>`;
      }

      // Send email as system notification (without checking preferences)
      await this.notificationsService.sendSystemNotification({
        userId: userId || 'system',
        type: NotificationType.EMAIL,
        title: subject,
        message: emailBody,
        recipient: to,
        metadata: { template, data },
      });
      
      this.logger.log(`✅ Email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`❌ Error handling notification.email.send:`, error);
    }
  }

  private async handleRegistrationSuccess(message: any) {
    try {
      this.logger.log(`Processing registration success event for user: ${message.userId}`);

      const { userId, email } = message;

      await this.notificationsService.sendNotification({
        userId,
        type: NotificationType.EMAIL,
        title: 'Bem-vindo ao SomaAI!',
        message: '<h1>Bem-vindo!</h1><p>Sua conta foi criada com sucesso.</p>',
        recipient: email,
      });
    } catch (error) {
      this.logger.error(`Error handling registration success:`, error);
    }
  }

  private async handleOrderCreated(message: any) {
    try {
      this.logger.log(`Processing order created event for user: ${message.userId}`);

      const { userId, orderId, email } = message;

      await this.notificationsService.sendNotification({
        userId,
        type: NotificationType.EMAIL,
        title: 'Pedido Confirmado',
        message: `<h1>Pedido #${orderId} Confirmado</h1><p>Seu pedido foi recebido com sucesso.</p>`,
        recipient: email,
        metadata: { orderId },
      });
    } catch (error) {
      this.logger.error(`Error handling order created:`, error);
    }
  }

  private async handleUserCreated(message: any) {
    try {
      this.logger.log(`Processing user created event for user: ${message.userId}`);

      const { userId, email, firstName } = message;

      await this.notificationsService.sendNotification({
        userId,
        type: NotificationType.EMAIL,
        title: 'Conta Criada',
        message: `<h1>Olá ${firstName}!</h1><p>Sua conta foi criada com sucesso.</p>`,
        recipient: email,
      });
    } catch (error) {
      this.logger.error(`Error handling user created:`, error);
    }
  }
}
