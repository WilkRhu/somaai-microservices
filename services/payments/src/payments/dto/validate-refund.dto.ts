import { IsNumber, IsString, IsUUID, Min, MinLength } from 'class-validator';

export class ValidateRefundDto {
  @IsUUID()
  paymentId: string;

  @IsString()
  @MinLength(10)
  reason: string;

  @IsNumber()
  @Min(0)
  refundAmount?: number;
}
