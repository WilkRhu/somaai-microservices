import { IsString, IsNumber, IsDateString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOfferDto {
  @ApiProperty({
    example: 'Summer Sale 2026',
    description: 'Offer name',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Special discount for summer season',
    description: 'Offer description (optional)',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 15,
    description: 'Discount percentage (0-100)',
  })
  @IsNotEmpty()
  @IsNumber()
  discountPercentage: number;

  @ApiProperty({
    example: '2026-06-01T00:00:00Z',
    description: 'Offer start date (ISO 8601 format)',
  })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: '2026-08-31T23:59:59Z',
    description: 'Offer end date (ISO 8601 format)',
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}
