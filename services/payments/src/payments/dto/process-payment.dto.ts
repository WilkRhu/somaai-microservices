import { IsString, IsNumber, IsOptional, IsEmail } from 'class-validator';

export class ProcessPaymentDto {
  @IsString()
  orderId: string;

  @IsNumber()
  amount: number;

  @IsString()
  paymentMethod: string; // 'credit_card', 'debit_card', 'pix', etc

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  installments?: string;
}
