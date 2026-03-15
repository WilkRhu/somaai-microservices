import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationConsumer } from './consumers/notification.consumer';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { DeviceToken } from './entities/device-token.entity';
import { ProvidersModule } from '../providers/providers.module';
import { KafkaModule } from '../kafka/kafka.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationPreference, DeviceToken]),
    ProvidersModule,
    KafkaModule,
    EmailModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationConsumer],
  exports: [NotificationsService],
})
export class NotificationsModule {}
