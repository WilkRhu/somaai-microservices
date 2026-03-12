import { IsString, IsNumber, IsArray, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSaleDto {
  @ApiProperty({
    example: 'customer-uuid-123',
    description: 'Customer ID',
  })
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @ApiProperty({
    example: [
      { productId: 'prod-1', quantity: 2, unitPrice: 50.00 },
      { productId: 'prod-2', quantity: 1, unitPrice: 100.00 },
    ],
    description: 'Array of items in the sale',
  })
  @IsNotEmpty()
  @IsArray()
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;

  @ApiProperty({
    example: 200.00,
    description: 'Total sale amount',
  })
  @IsNotEmpty()
  @IsNumber()
  totalAmount: number;

  @ApiPropertyOptional({
    example: 'offer-uuid-123',
    description: 'Offer ID (optional)',
  })
  @IsOptional()
  @IsString()
  offerId?: string;
}
