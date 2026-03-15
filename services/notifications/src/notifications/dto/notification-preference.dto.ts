import { IsBoolean, IsOptional, IsObject } from 'class-validator';

export class UpdateNotificationPreferenceDto {
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  smsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  marketingEmails?: boolean;

  @IsOptional()
  @IsBoolean()
  transactionalEmails?: boolean;

  @IsOptional()
  @IsBoolean()
  transactionalSms?: boolean;

  @IsOptional()
  @IsBoolean()
  transactionalPush?: boolean;

  @IsOptional()
  @IsObject()
  quietHours?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
}
