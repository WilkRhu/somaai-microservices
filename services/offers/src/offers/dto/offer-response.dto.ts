import { OfferStatus } from '../entities/offer.entity';

export class OfferResponseDto {
  id: string;
  name: string;
  description: string;
  discountPercentage: number;
  startDate: Date;
  endDate: Date;
  status: OfferStatus;
  createdAt: Date;
  updatedAt: Date;
}
