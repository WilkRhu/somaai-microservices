import { IsString, IsEnum, IsOptional, IsObject, IsArray } from 'class-validator';
import { NotificationType } from '../enums/notification-type.enum';

export class SendNotificationDto {
  @IsString()
  userId!: string;

  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsString()
  title!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  recipient?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsArray()
  channels?: NotificationType[];
}
