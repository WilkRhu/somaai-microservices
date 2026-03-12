import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInventoryItemDto {
  @ApiProperty({
    example: 'product-uuid-123',
    description: 'Product ID',
  })
  @IsNotEmpty()
  @IsString()
  productId: string;

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
