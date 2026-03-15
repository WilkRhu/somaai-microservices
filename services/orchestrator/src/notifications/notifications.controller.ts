import { Controller, Post, Body, Logger } from '@nestjs/common';
import { NotificationsClient } from './notifications.client';

@Controller('notifications')
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private notificationsClient: NotificationsClient) {}

  @Post('send')
  async send(@Body() dto: any) {
    try {
      this.logger.log(`Received notification request: ${JSON.stringify(dto)}`);
      await this.notificationsClient.send(dto);
      this.logger.log('Notification sent successfully');
      return { success: true, message: 'Notification sent' };
    } catch (error) {
      this.logger.error(`Error sending notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('send-email')
  async sendEmail(
    @Body() dto: { userId: string; recipient: string; title: string; message: string; metadata?: Record<string, any> },
  ) {
    await this.notificationsClient.sendEmail(dto.userId, dto.recipient, dto.title, dto.message, dto.metadata);
    return { success: true, message: 'Email notification sent' };
  }

  @Post('send-sms')
  async sendSms(
    @Body() dto: { userId: string; recipient: string; title: string; message: string; metadata?: Record<string, any> },
  ) {
    await this.notificationsClient.sendSms(dto.userId, dto.recipient, dto.title, dto.message, dto.metadata);
    return { success: true, message: 'SMS notification sent' };
  }

  @Post('send-push')
  async sendPush(
    @Body() dto: { userId: string; title: string; message: string; metadata?: Record<string, any> },
  ) {
    await this.notificationsClient.sendPush(dto.userId, dto.title, dto.message, dto.metadata);
    return { success: true, message: 'Push notification sent' };
  }
}
