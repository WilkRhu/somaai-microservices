import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class InventoryValidator {
  validateStockAvailable(currentQuantity: number, requestedQuantity: number): boolean {
    if (currentQuantity < requestedQuantity) {
      throw new HttpException(
        `Insufficient stock. Available: ${currentQuantity}, Requested: ${requestedQuantity}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return true;
  }

  validateReorderConfig(minQuantity: number, maxQuantity: number, currentQuantity: number): boolean {
    if (minQuantity >= maxQuantity) {
      throw new HttpException(
        'Minimum quantity must be less than maximum quantity',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (currentQuantity > maxQuantity) {
      throw new HttpException(
        'Current quantity cannot exceed maximum quantity',
        HttpStatus.BAD_REQUEST,
      );
    }

    return true;
  }

  validateMinMaxRatio(minQuantity: number, maxQuantity: number): boolean {
    if (minQuantity < 0 || maxQuantity < 0) {
      throw new HttpException(
        'Quantities cannot be negative',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (minQuantity >= maxQuantity) {
      throw new HttpException(
        'Minimum quantity must be less than maximum quantity',
        HttpStatus.BAD_REQUEST,
      );
    }

    return true;
  }

  validateQuantityUpdate(oldQuantity: number, newQuantity: number): boolean {
    if (newQuantity < 0) {
      throw new HttpException(
        'Quantity cannot be negative',
        HttpStatus.BAD_REQUEST,
      );
    }
    return true;
  }
}
