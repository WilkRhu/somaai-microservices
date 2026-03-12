import { ApiProperty } from '@nestjs/swagger';

export class SupplierResponseDto {
  @ApiProperty({
    example: 'supplier-uuid-123',
    description: 'Supplier ID',
  })
  id: string;

  @ApiProperty({
    example: 'Supplier Company Name',
    description: 'Supplier name',
  })
  name: string;

  @ApiProperty({
    example: '12345678000190',
    description: 'CNPJ (Brazilian business registration)',
  })
  cnpj: string;

  @ApiProperty({
    example: 'contact@supplier.com',
    description: 'Supplier email',
  })
  email: string;

  @ApiProperty({
    example: '+55 11 99999-9999',
    description: 'Supplier phone number',
  })
  phone: string;

  @ApiProperty({
    example: 'Rua Principal, 123, São Paulo, SP',
    description: 'Supplier address',
  })
  address: string;

  @ApiProperty({
    example: '2026-03-12T10:00:00Z',
    description: 'Creation date',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-03-12T10:00:00Z',
    description: 'Last update date',
  })
  updatedAt: Date;
}
