export class SubscriptionResponseDto {
  id: string;
  userId: string;
  establishmentId: string;
  planName: string;
  price: number;
  billingCycle: string;
  status: string;
  startDate?: Date;
  endDate?: Date;
  nextBillingDate?: Date;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}
