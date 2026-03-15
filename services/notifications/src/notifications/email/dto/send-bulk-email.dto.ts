import { IsString, IsOptional, IsArray } from 'class-validator';

export class SendBulkEmailDto {
  @IsArray()
  recipients!: string[];

  @IsString()
  subject!: string;

  @IsOptional()
  @IsString()
  template?: string;

  @IsOptional()
  @IsString()
  html?: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  data?: Record<string, any>;
}
