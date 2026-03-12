import { IsOptional, IsString, IsNumber, IsArray, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SaleStatus } from '../entities/sale.entity';

export class UpdateSaleDto {
  @ApiPropertyOptional({
    example: 'customer-uuid-123',
    description: 'Customer ID',
  })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({
    example: 200.00,
    description: 'Total sale amount',
  })
  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @ApiPropertyOptional({
    example: 'COMPLETED',
    description: 'Sale status',
    enum: ['PENDING', 'COMPLETED', 'CANCELLED'],
  })
  @IsOptional()
  @IsEnum(SaleStatus)
  status?: SaleStatus;

  @ApiPropertyOptional({
    example: [
      { productId: 'prod-1', quantity: 2, unitPrice: 50.00 },
    ],
    description: 'Array of items in the sale',
  })
  @IsOptional()
  @IsArray()
  items?: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;

  @ApiPropertyOptional({
    example: 'offer-uuid-123',
    description: 'Offer ID',
  })
  @IsOptional()
  @IsString()
  offerId?: string;
}
