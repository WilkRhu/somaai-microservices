import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { EmailService } from '../email.service';
import { KafkaService } from '../../kafka/kafka.service';

@Injectable()
export class RegistrationConsumer implements OnModuleInit {
  private readonly logger = new Logger(RegistrationConsumer.name);

  constructor(
    private kafkaService: KafkaService,
    private emailService: EmailService,
  ) {}

  async onModuleInit() {
    try {
      // Escutar eventos de registro bem-sucedido
      await this.kafkaService.subscribeToTopic(
        'auth.registration.success',
        this.handleRegistrationSuccess.bind(this),
      );
      this.logger.log('Registered consumer for auth.registration.success topic');

      // Escutar eventos de usuário criado
      await this.kafkaService.subscribeToTopic(
        'user.created',
        this.handleUserCreated.bind(this),
      );
      this.logger.log('Registered consumer for user.created topic');
    } catch (error) {
      this.logger.error(`Failed to register Kafka consumers: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Manipula evento de registro bem-sucedido
   */
  private async handleRegistrationSuccess(message: any) {
    try {
      this.logger.log(`Processing registration success event for user: ${message.userId}`);

      const { userId, email } = message;

      // Enviar email de boas-vindas
      await this.emailService.sendEmail({
        to: email,
        subject: 'Bem-vindo ao SomaAI!',
        template: 'user-welcome',
        data: {
          userName: email,
        },
      });

      this.logger.log(`Welcome email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(
        `Error handling registration success event: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Manipula evento de usuário criado
   */
  private async handleUserCreated(message: any) {
    try {
      this.logger.log(`Processing user created event for user: ${message.id}`);

      const { id, email, name } = message;

      // Enviar email de boas-vindas usando o template disponível
      await this.emailService.sendEmail({
        to: email,
        subject: 'Bem-vindo ao SomaAI!',
        template: 'user-welcome',
        data: {
          userName: name || email,
        },
      });

      this.logger.log(`Welcome email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(
        `Error handling user created event: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
