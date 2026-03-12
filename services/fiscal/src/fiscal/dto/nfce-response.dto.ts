import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NfceResponseDto {
  @ApiProperty({
    example: 'nfce-uuid-123',
    description: 'NFC-e ID',
  })
  id: string;

  @ApiProperty({
    example: 'establishment-uuid-123',
    description: 'Establishment ID',
  })
  establishmentId: string;

  @ApiProperty({
    example: 1,
    description: 'NFC-e number',
  })
  number: number;

  @ApiProperty({
    example: 1,
    description: 'NFC-e series',
  })
  series: number;

  @ApiProperty({
    example: 100.00,
    description: 'Total NFC-e value',
  })
  totalValue: number;

  @ApiProperty({
    example: 'AUTHORIZED',
    description: 'NFC-e status',
    enum: ['PENDING', 'AUTHORIZED', 'REJECTED', 'CANCELLED'],
  })
  status: string;

  @ApiPropertyOptional({
    example: '123456789012345',
    description: 'Protocol number from SEFAZ',
  })
  protocolNumber?: string;

  @ApiPropertyOptional({
    example: '123456789012345678901234567890123456789012',
    description: 'Authorization code from SEFAZ',
  })
  authorizationCode?: string;

  @ApiPropertyOptional({
    example: 'Invalid CNPJ',
    description: 'Rejection reason',
  })
  rejectionReason?: string;

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
