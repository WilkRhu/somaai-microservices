import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentResponseDto {
  @ApiProperty({
    example: 'payment-uuid-123',
    description: 'Payment ID',
  })
  id: string;

  @ApiProperty({
    example: 'order-uuid-123',
    description: 'Order ID',
  })
  orderId: string;

  @ApiProperty({
    example: 250.50,
    description: 'Payment amount',
  })
  amount: number;

  @ApiProperty({
    example: 'COMPLETED',
    description: 'Payment status',
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
  })
  status: string;

  @ApiProperty({
    example: 'credit_card',
    description: 'Payment method',
  })
  paymentMethod: string;

  @ApiPropertyOptional({
    example: 'txn_123456789',
    description: 'Transaction ID',
  })
  transactionId?: string;

  @ApiPropertyOptional({
    example: 'ext_123456789',
    description: 'External ID from payment gateway',
  })
  externalId?: string;

  @ApiProperty({
    example: '2026-03-12T10:00:00Z',
    description: 'Creation date',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-03-12T10:00:00Z',
    description: 'Last update date',
  })
  updatedAt: Date;
}
