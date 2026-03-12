import { IsNumber, IsUUID, Min, Max } from 'class-validator';

export class ValidateDiscountDto {
  @IsUUID()
  saleId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage: number;
}
