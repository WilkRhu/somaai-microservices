import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SaleStatus } from '../entities/sale.entity';

@Injectable()
export class SalesValidator {
  validateDiscountPercentage(percentage: number): boolean {
    if (percentage < 0 || percentage > 100) {
      throw new HttpException(
        'Discount percentage must be between 0 and 100',
        HttpStatus.BAD_REQUEST,
      );
    }
    return true;
  }

  validateStatusTransition(from: SaleStatus, to: SaleStatus): boolean {
    const validTransitions: Record<SaleStatus, SaleStatus[]> = {
      [SaleStatus.PENDING]: [SaleStatus.CONFIRMED, SaleStatus.CANCELLED],
      [SaleStatus.CONFIRMED]: [SaleStatus.PROCESSING, SaleStatus.CANCELLED],
      [SaleStatus.PROCESSING]: [SaleStatus.COMPLETED, SaleStatus.FAILED],
      [SaleStatus.COMPLETED]: [SaleStatus.REFUNDED],
      [SaleStatus.FAILED]: [SaleStatus.PENDING],
      [SaleStatus.CANCELLED]: [],
      [SaleStatus.REFUNDED]: [],
    };

    if (!validTransitions[from]?.includes(to)) {
      throw new HttpException(
        `Invalid status transition from ${from} to ${to}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return true;
  }

  validateSaleAmount(amount: number): boolean {
    if (amount <= 0) {
      throw new HttpException(
        'Sale amount must be greater than 0',
        HttpStatus.BAD_REQUEST,
      );
    }
    return true;
  }

  validateDiscountAmount(totalAmount: number, discountAmount: number): boolean {
    if (discountAmount > totalAmount) {
      throw new HttpException(
        'Discount amount cannot exceed total amount',
        HttpStatus.BAD_REQUEST,
      );
    }
    return true;
  }
}
