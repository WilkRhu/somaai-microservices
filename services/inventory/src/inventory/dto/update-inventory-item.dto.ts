import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateInventoryItemDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  minQuantity?: number;

  @IsOptional()
  @IsNumber()
  maxQuantity?: number;
}
