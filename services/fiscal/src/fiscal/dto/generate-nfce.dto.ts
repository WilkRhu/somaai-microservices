import { IsString, IsNumber, IsArray, IsOptional, IsDecimal } from 'class-validator';

export class NfceItemDto {
  @IsString()
  code: string;

  @IsString()
  description: string;

  @IsNumber()
  quantity: number;

  @IsDecimal()
  unitPrice: number;

  @IsDecimal()
  totalPrice: number;
}

export class GenerateNfceDto {
  @IsString()
  establishmentId: string;

  @IsNumber()
  number: number;

  @IsNumber()
  series: number;

  @IsArray()
  items: NfceItemDto[];

  @IsDecimal()
  totalValue: number;

  @IsOptional()
  @IsString()
  customerCpf?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
