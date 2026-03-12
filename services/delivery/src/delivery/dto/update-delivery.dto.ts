import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { DeliveryStatus } from '../entities/delivery.entity';

export class UpdateDeliveryDto {
  @IsOptional()
  @IsEnum(DeliveryStatus)
  status?: DeliveryStatus;

  @IsOptional()
  @IsDateString()
  estimatedDate?: string;

  @IsOptional()
  @IsDateString()
  actualDate?: string;
}
