import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { DeviceToken } from './entities/device-token.entity';
import { SendNotificationDto } from './dto/send-notification.dto';
import { SendBulkNotificationDto } from './dto/send-bulk-notification.dto';
import { UpdateNotificationPreferenceDto } from './dto/notification-preference.dto';
import { RegisterDeviceTokenDto } from './dto/register-device-token.dto';
import { NotificationType } from './enums/notification-type.enum';
import { NotificationStatus } from './enums/notification-status.enum';
import { SmsProvider } from '../providers/sms/sms.provider';
import { PushProvider } from '../providers/push/push.provider';
import { EmailService } from './email/email.service';
import { KafkaService } from '../kafka/kafka.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private preferenceRepository: Repository<NotificationPreference>,
    @InjectRepository(DeviceToken)
    private deviceTokenRepository: Repository<DeviceToken>,
    private smsProvider: SmsProvider,
    private pushProvider: PushProvider,
    private emailService: EmailService,
    private kafkaService: KafkaService,
  ) {}

  async sendNotification(dto: SendNotificationDto): Promise<Notification> {
    const preference = await this.getOrCreatePreference(dto.userId);

    if (!this.isChannelEnabled(dto.type, preference)) {
      throw new BadRequestException(`${dto.type} notifications are disabled for this user`);
    }

    const notification = this.notificationRepository.create({
      id: uuidv4(),
      userId: dto.userId,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      recipient: dto.recipient,
      metadata: dto.metadata,
      status: NotificationStatus.PENDING,
    });

    await this.notificationRepository.save(notification);

    // Send asynchronously
    this.sendAsync(notification, dto.recipient).catch((error) => {
      this.logger.error(`Failed to send notification ${notification.id}:`, error);
    });

    return notification;
  }

  async sendSystemNotification(dto: SendNotificationDto): Promise<Notification> {
    // Send notification without checking preferences (for system events)
    const notification = this.notificationRepository.create({
      id: uuidv4(),
      userId: dto.userId,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      recipient: dto.recipient,
      metadata: dto.metadata,
      status: NotificationStatus.PENDING,
    });

    await this.notificationRepository.save(notification);

    // Send asynchronously
    this.sendAsync(notification, dto.recipient).catch((error) => {
      this.logger.error(`Failed to send notification ${notification.id}:`, error);
    });

    return notification;
  }

  async sendBulkNotifications(dto: SendBulkNotificationDto): Promise<Notification[]> {
    const notifications: Notification[] = [];

    for (const userId of dto.userIds) {
      const notification = await this.sendNotification({
        userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        metadata: dto.metadata,
        channels: dto.channels,
      });
      notifications.push(notification);
    }

    return notifications;
  }

  private async sendAsync(notification: Notification, recipient?: string): Promise<void> {
    try {
      let result: any;

      switch (notification.type) {
        case NotificationType.EMAIL:
          const emailRecipient = recipient || notification.recipient;
          if (!emailRecipient) {
            throw new Error('No recipient provided for EMAIL');
          }
          result = await this.emailService.sendEmail({
            to: emailRecipient,
            subject: notification.title,
            html: notification.message,
            template: 'default',
          });
          break;

        case NotificationType.SMS:
          const smsRecipient = recipient || notification.recipient;
          if (!smsRecipient) {
            throw new Error('No recipient provided for SMS');
          }
          result = await this.smsProvider.send({
            to: smsRecipient,
            message: `${notification.title}: ${notification.message}`,
          });
          break;

        case NotificationType.PUSH:
          const deviceTokens = await this.deviceTokenRepository.find({
            where: { userId: notification.userId, isActive: true },
          });

          if (deviceTokens.length === 0) {
            throw new Error('No active device tokens found');
          }

          result = await this.pushProvider.sendMulticast(
            deviceTokens.map((dt) => dt.token),
            notification.title,
            notification.message,
            notification.metadata,
          );
          break;
      }

      if (result.success) {
        notification.status = NotificationStatus.SENT;
        notification.sentAt = new Date();
        notification.externalId = result.messageId;
      } else {
        notification.status = NotificationStatus.FAILED;
        notification.errorMessage = result.error;
      }
    } catch (error) {
      notification.status = NotificationStatus.FAILED;
      notification.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      notification.retryCount++;
    }

    await this.notificationRepository.save(notification);
  }

  async getNotificationPreference(userId: string): Promise<NotificationPreference> {
    return this.getOrCreatePreference(userId);
  }

  async updateNotificationPreference(
    userId: string,
    dto: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreference> {
    let preference = await this.preferenceRepository.findOne({ where: { userId } });

    if (!preference) {
      preference = this.preferenceRepository.create({
        id: uuidv4(),
        userId,
        ...dto,
      });
    } else {
      Object.assign(preference, dto);
    }

    return this.preferenceRepository.save(preference);
  }

  async registerDeviceToken(userId: string, dto: RegisterDeviceTokenDto): Promise<DeviceToken> {
    let deviceToken = await this.deviceTokenRepository.findOne({
      where: { userId, token: dto.token },
    });

    if (!deviceToken) {
      deviceToken = this.deviceTokenRepository.create({
        id: uuidv4(),
        userId,
        ...dto,
      });
    } else {
      deviceToken.isActive = true;
      deviceToken.lastUsedAt = new Date();
    }

    return this.deviceTokenRepository.save(deviceToken);
  }

  async unregisterDeviceToken(userId: string, token: string): Promise<void> {
    await this.deviceTokenRepository.update(
      { userId, token },
      { isActive: false },
    );
  }

  async getNotifications(userId: string, limit: number = 50, offset: number = 0): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new BadRequestException('Notification not found');
    }

    notification.metadata = {
      ...notification.metadata,
      readAt: new Date(),
    };

    return this.notificationRepository.save(notification);
  }

  private async getOrCreatePreference(userId: string): Promise<NotificationPreference> {
    let preference = await this.preferenceRepository.findOne({ where: { userId } });

    if (!preference) {
      preference = this.preferenceRepository.create({
        id: uuidv4(),
        userId,
      });
      await this.preferenceRepository.save(preference);
    }

    return preference;
  }

  private isChannelEnabled(type: NotificationType, preference: NotificationPreference): boolean {
    switch (type) {
      case NotificationType.EMAIL:
        return preference.emailEnabled === true || (preference.emailEnabled as any) == 1;
      case NotificationType.SMS:
        return preference.smsEnabled === true || (preference.smsEnabled as any) == 1;
      case NotificationType.PUSH:
        return preference.pushEnabled === true || (preference.pushEnabled as any) == 1;
      default:
        return false;
    }
  }
}
