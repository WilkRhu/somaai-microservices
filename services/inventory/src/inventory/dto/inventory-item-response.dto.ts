import { ApiProperty } from '@nestjs/swagger';

export class InventoryItemResponseDto {
  @ApiProperty({
    example: 'inventory-uuid-123',
    description: 'Inventory item ID',
  })
  id: string;

  @ApiProperty({
    example: 'product-uuid-123',
    description: 'Product ID',
  })
  productId: string;

  @ApiProperty({
    example: 100,
    description: 'Current quantity in stock',
  })
  quantity: number;

  @ApiProperty({
    example: 10,
    description: 'Minimum quantity threshold',
  })
  minQuantity: number;

  @ApiProperty({
    example: 500,
    description: 'Maximum quantity threshold',
  })
  maxQuantity: number;

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
