import { IsString, IsNumber, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInventoryItemDto {
  @ApiProperty({
    example: 'product-uuid-123',
    description: 'Product ID',
  })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiPropertyOptional({
    example: 'establishment-uuid-123',
    description: 'Establishment ID',
  })
  @IsOptional()
  @IsString()
  establishmentId?: string;

  @ApiPropertyOptional({
    example: '2026-12-31T00:00:00Z',
    description: 'Expiration date of the item',
  })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @ApiProperty({
    example: 100,
    description: 'Current quantity in stock',
  })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty({
    example: 10,
    description: 'Minimum quantity threshold',
  })
  @IsNotEmpty()
  @IsNumber()
  minQuantity: number;

  @ApiProperty({
    example: 500,
    description: 'Maximum quantity threshold',
  })
  @IsNotEmpty()
  @IsNumber()
  maxQuantity: number;
}
