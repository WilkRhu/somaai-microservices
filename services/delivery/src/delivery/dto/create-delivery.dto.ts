import { IsString, IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDeliveryDto {
  @ApiProperty({
    example: 'sale-uuid-123',
    description: 'Sale ID',
  })
  @IsNotEmpty()
  @IsString()
  saleId: string;

  @ApiProperty({
    example: '2026-03-20T10:00:00Z',
    description: 'Estimated delivery date (ISO 8601 format)',
  })
  @IsNotEmpty()
  @IsDateString()
  estimatedDate: string;
}
