export class PurchaseResponseDto {
  id: string;
  userId: string;
  merchant: string;
  description?: string;
  amount: number;
  paymentMethod: string;
  purchasedAt: Date;
  items?: any[];
  installments?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class PurchaseSummaryDto {
  totalSpent: number;
  averageSpent: number;
  totalPurchases: number;
  lastPurchaseDate?: Date;
  topMerchant?: string;
  topCategory?: string;
}
