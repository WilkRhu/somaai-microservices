import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { EmailService } from '../email.service';
import { KafkaService } from '../../../kafka/kafka.service';

@Injectable()
export class RegistrationConsumer implements OnModuleInit {
  private readonly logger = new Logger(RegistrationConsumer.name);

  constructor(
    private kafkaService: KafkaService,
    private emailService: EmailService,
  ) {}

  async onModuleInit() {
    try {
      await this.kafkaService.subscribeToTopic(
        'auth.registration.success',
        this.handleRegistrationSuccess.bind(this),
      );
      this.logger.log('Registered consumer for auth.registration.success topic');

      await this.kafkaService.subscribeToTopic(
        'user.created',
        this.handleUserCreated.bind(this),
      );
      this.logger.log('Registered consumer for user.created topic');
    } catch (error) {
      this.logger.error(
        `Failed to register Kafka consumers: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async handleRegistrationSuccess(message: any) {
    try {
      this.logger.log(`Processing registration success event for user: ${message.userId}`);

      const { userId, email } = message;

      await this.emailService.sendEmail({
        to: email,
        subject: 'Bem-vindo ao SomaAI!',
        template: 'user-welcome',
        data: {
          userName: email,
        },
      });
    } catch (error) {
      this.logger.error(`Error handling registration success:`, error);
    }
  }

  private async handleUserCreated(message: any) {
    try {
      this.logger.log(`Processing user created event for user: ${message.userId}`);

      const { userId, email, firstName } = message;

      await this.emailService.sendEmail({
        to: email,
        subject: 'Conta Criada',
        template: 'user-welcome',
        data: {
          userName: firstName || email,
        },
      });
    } catch (error) {
      this.logger.error(`Error handling user created:`, error);
    }
  }
}
