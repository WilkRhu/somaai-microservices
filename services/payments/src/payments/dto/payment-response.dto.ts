export class PaymentResponseDto {
  id: string;
  orderId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  transactionId?: string;
  externalId?: string;
  createdAt: Date;
  updatedAt: Date;
}
