import { DeliveryStatus } from '../entities/delivery.entity';

export class DeliveryResponseDto {
  id: string;
  saleId: string;
  status: DeliveryStatus;
  trackingCode: string;
  estimatedDate: Date;
  actualDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
