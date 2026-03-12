import { IsString, IsNumber, IsOptional, IsArray, IsEnum } from 'class-validator';
import { PaymentMethod } from '../../shared/enums/payment-method.enum';

export class CreatePurchaseDto {
  @IsString()
  userId: string;

  @IsString()
  merchant: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  amount: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsString()
  purchasedAt: string;

  @IsArray()
  @IsOptional()
  items?: any[];

  @IsNumber()
  @IsOptional()
  installments?: number;
}
