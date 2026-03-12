import { IsNumber, Min } from 'class-validator';

export class ValidateReorderDto {
  @IsNumber()
  @Min(0)
  minQuantity: number;

  @IsNumber()
  @Min(0)
  maxQuantity: number;

  @IsNumber()
  @Min(0)
  currentQuantity: number;
}
