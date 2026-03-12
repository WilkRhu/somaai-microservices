import { DeliveryStatus } from '../entities/delivery.entity';
import { ApiProperty } from '@nestjs/swagger';

export class DeliveryResponseDto {
  @ApiProperty({
    example: 'delivery-uuid-123',
    description: 'Delivery ID',
  })
  id: string;

  @ApiProperty({
    example: 'sale-uuid-123',
    description: 'Sale ID',
  })
  saleId: string;

  @ApiProperty({
    example: 'PENDING',
    description: 'Delivery status',
    enum: ['PENDING', 'IN_TRANSIT', 'DELIVERED', 'FAILED'],
  })
  status: DeliveryStatus;

  @ApiProperty({
    example: 'BR123456789',
    description: 'Tracking code',
  })
  trackingCode: string;

  @ApiProperty({
    example: '2026-03-20T10:00:00Z',
    description: 'Estimated delivery date',
  })
  estimatedDate: Date;

  @ApiProperty({
    example: '2026-03-19T14:30:00Z',
    description: 'Actual delivery date',
  })
  actualDate: Date;

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
