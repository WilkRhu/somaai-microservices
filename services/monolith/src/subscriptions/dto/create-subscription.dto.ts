import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  establishmentId: string;

  @IsString()
  planName: string;

  @IsNumber()
  price: number;

  @IsString()
  billingCycle: string; // monthly, yearly

  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;
}
