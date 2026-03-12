import { IsOptional, IsString, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { OfferStatus } from '../entities/offer.entity';

export class UpdateOfferDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  discountPercentage?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;
}
