import { IsArray, IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { NotificationType } from '../enums/notification-type.enum';

export class SendBulkNotificationDto {
  @IsArray()
  userIds!: string[];

  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsString()
  title!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsArray()
  channels?: NotificationType[];
}
