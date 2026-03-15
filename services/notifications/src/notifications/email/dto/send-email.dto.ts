import { IsString, IsOptional, IsEmail, IsArray } from 'class-validator';

export class SendEmailDto {
  @IsEmail()
  to!: string;

  @IsOptional()
  @IsEmail()
  cc?: string;

  @IsOptional()
  @IsEmail()
  bcc?: string;

  @IsString()
  subject!: string;

  @IsOptional()
  @IsString()
  template?: string;

  @IsOptional()
  html?: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  data?: Record<string, any>;
}
