import { OfferStatus } from '../entities/offer.entity';
import { ApiProperty } from '@nestjs/swagger';

export class OfferResponseDto {
  @ApiProperty({
    example: 'offer-uuid-123',
    description: 'Offer ID',
  })
  id: string;

  @ApiProperty({
    example: 'Summer Sale 2026',
    description: 'Offer name',
  })
  name: string;

  @ApiProperty({
    example: 'Special discount for summer season',
    description: 'Offer description',
  })
  description: string;

  @ApiProperty({
    example: 15,
    description: 'Discount percentage (0-100)',
  })
  discountPercentage: number;

  @ApiProperty({
    example: '2026-06-01T00:00:00Z',
    description: 'Offer start date',
  })
  startDate: Date;

  @ApiProperty({
    example: '2026-08-31T23:59:59Z',
    description: 'Offer end date',
  })
  endDate: Date;

  @ApiProperty({
    example: 'ACTIVE',
    description: 'Offer status',
    enum: ['ACTIVE', 'INACTIVE', 'EXPIRED'],
  })
  status: OfferStatus;

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
