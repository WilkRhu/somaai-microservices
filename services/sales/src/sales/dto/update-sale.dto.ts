import { IsOptional, IsString, IsNumber, IsArray, IsEnum } from 'class-validator';
import { SaleStatus } from '../entities/sale.entity';

export class UpdateSaleDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @IsOptional()
  @IsEnum(SaleStatus)
  status?: SaleStatus;

  @IsOptional()
  @IsArray()
  items?: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;

  @IsOptional()
  @IsString()
  offerId?: string;
}
