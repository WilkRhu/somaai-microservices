import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    example: 'est-123',
    description: 'Establishment ID',
  })
  @IsString()
  establishmentId: string;

  @ApiProperty({
    example: 'cust-456',
    description: 'Customer ID',
  })
  @IsString()
  customerId: string;

  @ApiProperty({
    example: 150.5,
    description: 'Total amount',
  })
  @IsNumber()
  totalAmount: number;

  @ApiProperty({
    example: [
      {
        productId: 'prod-1',
        quantity: 2,
        unitPrice: 50.25,
      },
    ],
    description: 'Order items',
  })
  @IsArray()
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;

  @ApiProperty({
    example: 'Rua Principal, 123',
    description: 'Delivery address',
    required: false,
  })
  @IsOptional()
  @IsString()
  deliveryAddress?: string;
}
