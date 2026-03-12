import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateOfferDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  discountPercentage: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
