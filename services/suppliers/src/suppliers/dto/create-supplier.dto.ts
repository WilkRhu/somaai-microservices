import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  name: string;

  @IsString()
  cnpj: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  address?: string;
}
