import { SaleStatus } from '../entities/sale.entity';

export class SaleResponseDto {
  id: string;
  customerId: string;
  totalAmount: number;
  status: SaleStatus;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  discountApplied?: number;
  offerId?: string;
  createdAt: Date;
  updatedAt: Date;
}
