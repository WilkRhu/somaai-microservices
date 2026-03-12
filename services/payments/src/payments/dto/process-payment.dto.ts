import { IsString, IsNumber, IsOptional, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProcessPaymentDto {
  @ApiProperty({
    example: 'order-uuid-123',
    description: 'Order ID',
  })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({
    example: 250.50,
    description: 'Payment amount',
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: 'credit_card',
    description: 'Payment method (credit_card, debit_card, pix, etc)',
    enum: ['credit_card', 'debit_card', 'pix', 'boleto'],
  })
  @IsNotEmpty()
  @IsString()
  paymentMethod: string;

  @ApiPropertyOptional({
    example: 'Payment for order #123',
    description: 'Payment description (optional)',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'customer@example.com',
    description: 'Customer email (optional)',
  })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Customer name (optional)',
  })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({
    example: '3',
    description: 'Number of installments (optional)',
  })
  @IsOptional()
  @IsString()
  installments?: string;
}
