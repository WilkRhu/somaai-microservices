import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateInventoryItemDto {
  @ApiPropertyOptional({
    example: 'product-uuid-123',
    description: 'Product ID',
  })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({
    example: 100,
    description: 'Current quantity in stock',
  })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Minimum quantity threshold',
  })
  @IsOptional()
  @IsNumber()
  minQuantity?: number;

  @ApiPropertyOptional({
    example: 500,
    description: 'Maximum quantity threshold',
  })
  @IsOptional()
  @IsNumber()
  maxQuantity?: number;
}
