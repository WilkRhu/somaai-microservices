import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DeliveryStatus } from '../entities/delivery.entity';

export class UpdateDeliveryDto {
  @ApiPropertyOptional({
    example: 'DELIVERED',
    description: 'Delivery status',
    enum: ['PENDING', 'IN_TRANSIT', 'DELIVERED', 'FAILED'],
  })
  @IsOptional()
  @IsEnum(DeliveryStatus)
  status?: DeliveryStatus;

  @ApiPropertyOptional({
    example: '2026-03-20T10:00:00Z',
    description: 'Estimated delivery date (ISO 8601 format)',
  })
  @IsOptional()
  @IsDateString()
  estimatedDate?: string;

  @ApiPropertyOptional({
    example: '2026-03-19T14:30:00Z',
    description: 'Actual delivery date (ISO 8601 format)',
  })
  @IsOptional()
  @IsDateString()
  actualDate?: string;
}
