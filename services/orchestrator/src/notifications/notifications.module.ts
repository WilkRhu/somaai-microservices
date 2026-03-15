import { Module } from '@nestjs/common';
import { KafkaModule } from '../kafka/kafka.module';
import { NotificationsClient } from './notifications.client';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [KafkaModule],
  controllers: [NotificationsController],
  providers: [NotificationsClient],
  exports: [NotificationsClient],
})
export class NotificationsModule {}
