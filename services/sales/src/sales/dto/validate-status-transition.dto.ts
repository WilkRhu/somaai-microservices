import { IsEnum, IsUUID } from 'class-validator';
import { SaleStatus } from '../entities/sale.entity';

export class ValidateStatusTransitionDto {
  @IsUUID()
  saleId: string;

  @IsEnum(SaleStatus)
  currentStatus: SaleStatus;

  @IsEnum(SaleStatus)
  newStatus: SaleStatus;
}
