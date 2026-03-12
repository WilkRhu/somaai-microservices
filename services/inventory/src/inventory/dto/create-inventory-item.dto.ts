import { IsString, IsNumber } from 'class-validator';

export class CreateInventoryItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  minQuantity: number;

  @IsNumber()
  maxQuantity: number;
}
