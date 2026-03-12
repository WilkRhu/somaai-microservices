import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CrossServiceValidator {
  constructor(private httpService: HttpService) {}

  async validateInventoryForSale(saleItems: any[]): Promise<boolean> {
    try {
      const inventoryServiceUrl = process.env.BUSINESS_SERVICE_URL || 'http://localhost:3011';

      for (const item of saleItems) {
        const response = await firstValueFrom(
          this.httpService.get(
            `${inventoryServiceUrl}/api/inventory/${item.productId}`,
          ),
        );

        const inventoryItem = response.data;

        if (inventoryItem.quantity < item.quantity) {
          throw new HttpException(
            `Insufficient inventory for product ${item.productId}. Available: ${inventoryItem.quantity}, Requested: ${item.quantity}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `Failed to validate inventory: ${error.message}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async validateCustomerExists(customerId: string): Promise<boolean> {
    try {
      const businessServiceUrl = process.env.BUSINESS_SERVICE_URL || 'http://localhost:3011';

      const response = await firstValueFrom(
        this.httpService.get(
          `${businessServiceUrl}/api/customers/${customerId}`,
        ),
      );

      if (!response.data) {
        throw new HttpException(
          `Customer not found: ${customerId}`,
          HttpStatus.NOT_FOUND,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `Failed to validate customer: ${error.message}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async validateOfferExists(offerId: string): Promise<boolean> {
    try {
      const businessServiceUrl = process.env.BUSINESS_SERVICE_URL || 'http://localhost:3011';

      const response = await firstValueFrom(
        this.httpService.get(
          `${businessServiceUrl}/api/offers/${offerId}`,
        ),
      );

      if (!response.data) {
        throw new HttpException(
          `Offer not found: ${offerId}`,
          HttpStatus.NOT_FOUND,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `Failed to validate offer: ${error.message}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
