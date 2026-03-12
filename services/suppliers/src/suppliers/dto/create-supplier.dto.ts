import { IsString, IsEmail, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({
    example: 'Supplier Company Name',
    description: 'Supplier name',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: '12345678000190',
    description: 'CNPJ (Brazilian business registration)',
  })
  @IsNotEmpty()
  @IsString()
  cnpj: string;

  @ApiProperty({
    example: 'contact@supplier.com',
    description: 'Supplier email',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '+55 11 99999-9999',
    description: 'Supplier phone number',
  })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiPropertyOptional({
    example: 'Rua Principal, 123, São Paulo, SP',
    description: 'Supplier address (optional)',
  })
  @IsOptional()
  @IsString()
  address?: string;
}
