import { IsEmail, IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiProperty({
    example: 'customer@example.com',
    description: 'Recipient email address',
  })
  @IsEmail()
  to!: string;

  @ApiPropertyOptional({
    example: 'cc@example.com',
    description: 'CC email address',
  })
  @IsOptional()
  @IsEmail()
  cc?: string;

  @ApiPropertyOptional({
    example: 'bcc@example.com',
    description: 'BCC email address',
  })
  @IsOptional()
  @IsEmail()
  bcc?: string;

  @ApiProperty({
    example: 'Order Confirmation',
    description: 'Email subject',
  })
  @IsString()
  subject!: string;

  @ApiProperty({
    example: 'order-confirmation',
    description: 'Email template name',
  })
  @IsString()
  template!: string;

  @ApiProperty({
    example: { orderNumber: 'ORD-001', totalAmount: 250.50 },
    description: 'Template variables',
  })
  @IsObject()
  data!: Record<string, any>;
}
