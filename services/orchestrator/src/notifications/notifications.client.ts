import { Injectable, Logger } from '@nestjs/common';
import { KafkaService } from '../kafka/kafka.service';

export interface SendNotificationDto {
  userId: string;
  type: 'EMAIL' | 'SMS' | 'PUSH';
  title: string;
  message: string;
  recipient?: string; // email address or phone number
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationsClient {
  private readonly logger = new Logger(NotificationsClient.name);

  constructor(private kafkaService: KafkaService) {
    this.logger.log('NotificationsClient initialized');
  }

  async send(dto: SendNotificationDto): Promise<void> {
    try {
      this.logger.log(`Attempting to publish notification: userId=${dto.userId}, type=${dto.type}`);
      const result = await this.kafkaService.publishEvent('notification.send', dto);
      this.logger.log(`Notification event published successfully: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error(`Failed to publish notification event: ${error.message}`, error.stack);
      throw error;
    }
  }

  async sendEmail(userId: string, recipient: string, title: string, message: string, metadata?: Record<string, any>): Promise<void> {
    return this.send({ userId, type: 'EMAIL', title, message, recipient, metadata });
  }

  async sendSms(userId: string, recipient: string, title: string, message: string, metadata?: Record<string, any>): Promise<void> {
    return this.send({ userId, type: 'SMS', title, message, recipient, metadata });
  }

  async sendPush(userId: string, title: string, message: string, metadata?: Record<string, any>): Promise<void> {
    return this.send({ userId, type: 'PUSH', title, message, metadata });
  }
}
