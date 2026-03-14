import { IsString, IsNumber, IsOptional, IsArray, IsEnum, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../shared/enums/payment-method.enum';
import { PurchaseType } from '../enums/purchase-type.enum';

export class PurchaseItemDto {
  @IsString()
  name: string;

  @IsNumber()
  quantity: number;

  @IsString()
  unit: string;

  @IsNumber()
  unitPrice: number;

  @IsString()
  @IsOptional()
  category?: string;
}

export class OcrExtractedDataDto {
  @IsString()
  @IsOptional()
  text?: string;

  @IsOptional()
  extractedData?: Record<string, any>;

  @IsNumber()
  @IsOptional()
  confidence?: number;

  @IsString()
  @IsOptional()
  documentType?: string;
}

export class CreatePurchaseDto {
  @IsEnum(PurchaseType)
  type: PurchaseType;

  @IsString()
  merchant: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  amount: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsDateString()
  purchasedAt: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDto)
  @IsOptional()
  items?: PurchaseItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDto)
  @IsOptional()
  products?: PurchaseItemDto[];

  @IsNumber()
  @IsOptional()
  installments?: number = 1;

  @ValidateNested()
  @Type(() => OcrExtractedDataDto)
  @IsOptional()
  ocrData?: OcrExtractedDataDto;
}
