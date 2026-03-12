import { IsString, IsNumber, IsArray, IsOptional, IsDecimal, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NfceItemDto {
  @ApiProperty({
    example: 'PROD001',
    description: 'Product code',
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    example: 'Product Description',
    description: 'Product description',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example: 2,
    description: 'Quantity',
  })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty({
    example: 50.00,
    description: 'Unit price',
  })
  @IsNotEmpty()
  @IsDecimal()
  unitPrice: number;

  @ApiProperty({
    example: 100.00,
    description: 'Total price (quantity * unitPrice)',
  })
  @IsNotEmpty()
  @IsDecimal()
  totalPrice: number;
}

export class GenerateNfceDto {
  @ApiProperty({
    example: 'establishment-uuid-123',
    description: 'Establishment ID',
  })
  @IsNotEmpty()
  @IsString()
  establishmentId: string;

  @ApiProperty({
    example: 1,
    description: 'NFC-e number',
  })
  @IsNotEmpty()
  @IsNumber()
  number: number;

  @ApiProperty({
    example: 1,
    description: 'NFC-e series',
  })
  @IsNotEmpty()
  @IsNumber()
  series: number;

  @ApiProperty({
    example: [
      { code: 'PROD001', description: 'Product 1', quantity: 2, unitPrice: 50.00, totalPrice: 100.00 },
    ],
    description: 'Array of items in the NFC-e',
  })
  @IsNotEmpty()
  @IsArray()
  items: NfceItemDto[];

  @ApiProperty({
    example: 100.00,
    description: 'Total NFC-e value',
  })
  @IsNotEmpty()
  @IsDecimal()
  totalValue: number;

  @ApiPropertyOptional({
    example: '12345678901',
    description: 'Customer CPF (optional)',
  })
  @IsOptional()
  @IsString()
  customerCpf?: string;

  @ApiPropertyOptional({
    example: 'credit_card',
    description: 'Payment method (optional)',
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
