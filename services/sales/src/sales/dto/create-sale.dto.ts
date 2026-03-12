import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';

export class CreateSaleDto {
  @IsString()
  customerId: string;

  @IsArray()
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;

  @IsNumber()
  totalAmount: number;

  @IsOptional()
  @IsString()
  offerId?: string;
}
