import { IsNumber, IsUUID, Min } from 'class-validator';

export class ValidateStockLevelsDto {
  @IsUUID()
  itemId: string;

  @IsNumber()
  @Min(0)
  requestedQuantity: number;
}
