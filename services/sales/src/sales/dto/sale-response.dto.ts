import { SaleStatus } from '../entities/sale.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SaleResponseDto {
  @ApiProperty({
    example: 'sale-uuid-123',
    description: 'Sale ID',
  })
  id: string;

  @ApiProperty({
    example: 'customer-uuid-123',
    description: 'Customer ID',
  })
  customerId: string;

  @ApiProperty({
    example: 200.00,
    description: 'Total sale amount',
  })
  totalAmount: number;

  @ApiProperty({
    example: 'COMPLETED',
    description: 'Sale status',
    enum: ['PENDING', 'COMPLETED', 'CANCELLED'],
  })
  status: SaleStatus;

  @ApiProperty({
    example: [
      { productId: 'prod-1', quantity: 2, unitPrice: 50.00, subtotal: 100.00 },
    ],
    description: 'Array of items in the sale',
  })
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;

  @ApiPropertyOptional({
    example: 20.00,
    description: 'Discount applied',
  })
  discountApplied?: number;

  @ApiPropertyOptional({
    example: 'offer-uuid-123',
    description: 'Offer ID',
  })
  offerId?: string;

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
