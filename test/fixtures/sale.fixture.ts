import { CreateSaleDto } from '../../services/sales/src/sales/dto/create-sale.dto';
import { SaleEntity, SaleStatus } from '../../services/sales/src/sales/entities/sale.entity';

export const createSaleFixture = (): CreateSaleDto => ({
  customerId: 'cust-123',
  items: [
    {
      productId: 'prod-001',
      quantity: 2,
      unitPrice: 100,
    },
  ],
  totalAmount: 200,
  status: SaleStatus.PENDING,
});

export const saleEntityFixture = (): SaleEntity => ({
  id: 'sale-123',
  customerId: 'cust-123',
  items: [
    {
      productId: 'prod-001',
      quantity: 2,
      unitPrice: 100,
    },
  ],
  totalAmount: 200,
  status: SaleStatus.PENDING,
  createdAt: new Date(),
  updatedAt: new Date(),
});
