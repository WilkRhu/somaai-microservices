import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

interface InventoryItem {
  productId: string;
  quantity: number;
  [key: string]: unknown;
}

type BusinessResponse = Record<string, unknown>;

@Injectable()
export class CrossServiceValidator {
  constructor(private httpService: HttpService) {}

  async validateInventoryForSale(saleItems: any[]): Promise<boolean> {
    try {
      const inventoryServiceUrl =
        process.env.BUSINESS_SERVICE_URL || 'http://localhost:3011';

      for (const item of saleItems) {
        const response: AxiosResponse<InventoryItem> = await firstValueFrom(
          this.httpService.get<InventoryItem>(
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

      const message = error instanceof Error ? error.message : String(error);
      throw new HttpException(
        `Failed to validate inventory: ${message}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async validateCustomerExists(customerId: string): Promise<boolean> {
    try {
      const businessServiceUrl =
        process.env.BUSINESS_SERVICE_URL || 'http://localhost:3011';

      const response: AxiosResponse<BusinessResponse> = await firstValueFrom(
        this.httpService.get<BusinessResponse>(
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

      const message = error instanceof Error ? error.message : String(error);
      throw new HttpException(
        `Failed to validate customer: ${message}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async validateOfferExists(offerId: string): Promise<boolean> {
    try {
      const businessServiceUrl =
        process.env.BUSINESS_SERVICE_URL || 'http://localhost:3011';

      const response: AxiosResponse<BusinessResponse> = await firstValueFrom(
        this.httpService.get<BusinessResponse>(
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

      const message = error instanceof Error ? error.message : String(error);
      throw new HttpException(
        `Failed to validate offer: ${message}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
