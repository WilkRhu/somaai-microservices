import { IsString, IsDateString } from 'class-validator';

export class CreateDeliveryDto {
  @IsString()
  saleId: string;

  @IsDateString()
  estimatedDate: string;
}
