import { Controller, Post, Get, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { SendBulkNotificationDto } from './dto/send-bulk-notification.dto';
import { UpdateNotificationPreferenceDto } from './dto/notification-preference.dto';
import { RegisterDeviceTokenDto } from './dto/register-device-token.dto';
import { EmailService, StoredEmail } from './email/email.service';
import { SendEmailDto } from './email/dto/send-email.dto';
import { SendBulkEmailDto } from './email/dto/send-bulk-email.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
  ) {}

  // Notification endpoints
  @Post('send')
  async sendNotification(@Body() dto: SendNotificationDto) {
    return this.notificationsService.sendNotification(dto);
  }

  @Post('send-bulk')
  async sendBulkNotifications(@Body() dto: SendBulkNotificationDto) {
    return this.notificationsService.sendBulkNotifications(dto);
  }

  @Get('preferences/:userId')
  async getPreferences(@Param('userId') userId: string) {
    return this.notificationsService.getNotificationPreference(userId);
  }

  @Put('preferences/:userId')
  async updatePreferences(
    @Param('userId') userId: string,
    @Body() dto: UpdateNotificationPreferenceDto,
  ) {
    return this.notificationsService.updateNotificationPreference(userId, dto);
  }

  @Post('device-tokens')
  async registerDeviceToken(
    @Body() body: { userId: string; deviceToken: RegisterDeviceTokenDto },
  ) {
    return this.notificationsService.registerDeviceToken(body.userId, body.deviceToken);
  }

  @Delete('device-tokens/:userId/:token')
  async unregisterDeviceToken(
    @Param('userId') userId: string,
    @Param('token') token: string,
  ) {
    await this.notificationsService.unregisterDeviceToken(userId, token);
    return { message: 'Device token unregistered' };
  }

  @Get(':userId')
  async getNotifications(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;
    return this.notificationsService.getNotifications(userId, parsedLimit, parsedOffset);
  }

  @Put(':notificationId/read')
  async markAsRead(@Param('notificationId') notificationId: string) {
    return this.notificationsService.markAsRead(notificationId);
  }

  // Email endpoints
  @Post('email/send')
  async sendEmail(@Body() dto: SendEmailDto) {
    return this.emailService.sendEmail(dto);
  }

  @Post('email/send-bulk')
  async sendBulkEmail(@Body() dto: SendBulkEmailDto) {
    return this.emailService.sendBulkEmail(dto);
  }

  @Get('email/status/:emailId')
  async getEmailStatus(@Param('emailId') emailId: string): Promise<StoredEmail> {
    return this.emailService.getEmailStatus(emailId);
  }
}
