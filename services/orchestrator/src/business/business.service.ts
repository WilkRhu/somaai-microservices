import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BusinessService {
  private readonly logger = new Logger(BusinessService.name);
  private businessServiceUrl = process.env.BUSINESS_SERVICE_URL || 'http://localhost:3011';

  constructor(private httpService: HttpService) {}

  async proxyRequest(method: string, path: string, data?: any, authHeader?: string) {
    const url = `${this.businessServiceUrl}${path}`;

    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (authHeader) headers['Authorization'] = authHeader;

      const response = await firstValueFrom(
        this.httpService.request({ method: method.toLowerCase(), url, data, headers }),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Business proxy failed: ${method} ${url} - ${error.message}`);

      if (error.response) {
        throw new HttpException(
          error.response.data || error.message,
          error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else if (error.request) {
        throw new HttpException('Business service not responding', HttpStatus.SERVICE_UNAVAILABLE);
      } else {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Establishments
  async createEstablishment(data: any, authHeader?: string) {
    return this.proxyRequest('POST', '/api/establishments', data, authHeader);
  }

  async listEstablishments(skip?: number, take?: number, authHeader?: string) {
    return this.proxyRequest('GET', `/api/establishments?skip=${skip || 0}&take=${take || 20}`, undefined, authHeader);
  }

  async getEstablishment(id: string, authHeader?: string) {
    return this.proxyRequest('GET', `/api/establishments/${id}`, undefined, authHeader);
  }

  async updateEstablishment(id: string, data: any, authHeader?: string) {
    return this.proxyRequest('PUT', `/api/establishments/${id}`, data, authHeader);
  }

  async deleteEstablishment(id: string, authHeader?: string) {
    return this.proxyRequest('DELETE', `/api/establishments/${id}`, undefined, authHeader);
  }

  // Customers
  async createCustomer(data: any, authHeader?: string) {
    return this.proxyRequest('POST', '/api/customers', data, authHeader);
  }

  async listCustomers(skip?: number, take?: number, authHeader?: string) {
    return this.proxyRequest('GET', `/api/customers?skip=${skip || 0}&take=${take || 20}`, undefined, authHeader);
  }

  async getCustomer(id: string, authHeader?: string) {
    return this.proxyRequest('GET', `/api/customers/${id}`, undefined, authHeader);
  }

  async updateCustomer(id: string, data: any, authHeader?: string) {
    return this.proxyRequest('PUT', `/api/customers/${id}`, data, authHeader);
  }

  async deleteCustomer(id: string, authHeader?: string) {
    return this.proxyRequest('DELETE', `/api/customers/${id}`, undefined, authHeader);
  }

  // Inventory
  async createInventoryItem(data: any, authHeader?: string) {
    return this.proxyRequest('POST', '/api/inventory', data, authHeader);
  }

  async listInventoryItems(skip?: number, take?: number, authHeader?: string) {
    return this.proxyRequest('GET', `/api/inventory?skip=${skip || 0}&take=${take || 20}`, undefined, authHeader);
  }

  async getInventoryItem(id: string, authHeader?: string) {
    return this.proxyRequest('GET', `/api/inventory/${id}`, undefined, authHeader);
  }

  async updateInventoryItem(id: string, data: any, authHeader?: string) {
    return this.proxyRequest('PUT', `/api/inventory/${id}`, data, authHeader);
  }

  async deleteInventoryItem(id: string, authHeader?: string) {
    return this.proxyRequest('DELETE', `/api/inventory/${id}`, undefined, authHeader);
  }

  // Purchases (Sales)
  async createSale(data: any, authHeader?: string) {
    return this.proxyRequest('POST', '/api/users/' + data.userId + '/purchases', data, authHeader);
  }

  async listSales(skip?: number, take?: number, authHeader?: string) {
    return this.proxyRequest('GET', `/api/purchases?skip=${skip || 0}&take=${take || 20}`, undefined, authHeader);
  }

  async getSale(id: string, authHeader?: string) {
    return this.proxyRequest('GET', `/api/purchases/${id}`, undefined, authHeader);
  }

  async updateSale(id: string, data: any, authHeader?: string) {
    return this.proxyRequest('PUT', `/api/purchases/${id}`, data, authHeader);
  }

  async deleteSale(id: string, authHeader?: string) {
    return this.proxyRequest('DELETE', `/api/purchases/${id}`, undefined, authHeader);
  }

  // Expenses
  async createExpense(data: any, authHeader?: string) {
    return this.proxyRequest('POST', '/api/expenses', data, authHeader);
  }

  async listExpenses(skip?: number, take?: number, authHeader?: string) {
    return this.proxyRequest('GET', `/api/expenses?skip=${skip || 0}&take=${take || 20}`, undefined, authHeader);
  }

  async getExpense(id: string, authHeader?: string) {
    return this.proxyRequest('GET', `/api/expenses/${id}`, undefined, authHeader);
  }

  async updateExpense(id: string, data: any, authHeader?: string) {
    return this.proxyRequest('PUT', `/api/expenses/${id}`, data, authHeader);
  }

  async deleteExpense(id: string, authHeader?: string) {
    return this.proxyRequest('DELETE', `/api/expenses/${id}`, undefined, authHeader);
  }

  // Suppliers
  async createSupplier(data: any, authHeader?: string) {
    return this.proxyRequest('POST', '/api/suppliers', data, authHeader);
  }

  async listSuppliers(skip?: number, take?: number, authHeader?: string) {
    return this.proxyRequest('GET', `/api/suppliers?skip=${skip || 0}&take=${take || 20}`, undefined, authHeader);
  }

  async getSupplier(id: string, authHeader?: string) {
    return this.proxyRequest('GET', `/api/suppliers/${id}`, undefined, authHeader);
  }

  async updateSupplier(id: string, data: any, authHeader?: string) {
    return this.proxyRequest('PUT', `/api/suppliers/${id}`, data, authHeader);
  }

  async deleteSupplier(id: string, authHeader?: string) {
    return this.proxyRequest('DELETE', `/api/suppliers/${id}`, undefined, authHeader);
  }

  // MercadoPago
  async mercadopagoConnect(data: any, authHeader?: string) {
    return this.proxyRequest('POST', '/api/establishments/mercadopago/connect', data, authHeader);
  }

  async mercadopagoGetIntegration(authHeader?: string) {
    return this.proxyRequest('GET', '/api/establishments/mercadopago/integration', undefined, authHeader);
  }

  async mercadopagoDisconnect(authHeader?: string) {
    return this.proxyRequest('DELETE', '/api/establishments/mercadopago/disconnect', undefined, authHeader);
  }

  async mercadopagoCreatePreference(data: any, authHeader?: string) {
    return this.proxyRequest('POST', '/api/establishments/mercadopago/payment-preference', data, authHeader);
  }

  async mercadopagoGetPayment(paymentId: string, authHeader?: string) {
    return this.proxyRequest('GET', `/api/establishments/mercadopago/payment/${paymentId}`, undefined, authHeader);
  }

  // Loyalty Settings
  async getEstablishmentLoyaltySettings(id: string, authHeader?: string) {
    return this.proxyRequest('GET', `/api/establishments/${id}/loyalty-settings`, undefined, authHeader);
  }

  async updateEstablishmentLoyaltySettings(id: string, data: any, authHeader?: string) {
    return this.proxyRequest('PATCH', `/api/establishments/${id}/loyalty-settings`, data, authHeader);
  }

  async getCustomerLoyalty(establishmentId: string, customerId: string, authHeader?: string) {
    return this.proxyRequest('GET', `/api/establishments/${establishmentId}/customers/${customerId}/loyalty`, undefined, authHeader);
  }

  async addCustomerLoyaltyPoints(establishmentId: string, customerId: string, data: any, authHeader?: string) {
    return this.proxyRequest('POST', `/api/establishments/${establishmentId}/customers/${customerId}/loyalty/add`, data, authHeader);
  }

  async redeemCustomerLoyaltyPoints(establishmentId: string, customerId: string, data: any, authHeader?: string) {
    return this.proxyRequest('POST', `/api/establishments/${establishmentId}/customers/${customerId}/loyalty/redeem`, data, authHeader);
  }

  // Offers
  async createOffer(data: any, authHeader?: string) {
    return this.proxyRequest('POST', '/api/offers', data, authHeader);
  }

  async listOffers(skip?: number, take?: number, authHeader?: string) {
    return this.proxyRequest('GET', `/api/offers?skip=${skip || 0}&take=${take || 20}`, undefined, authHeader);
  }

  async getOffer(id: string, authHeader?: string) {
    return this.proxyRequest('GET', `/api/offers/${id}`, undefined, authHeader);
  }

  async updateOffer(id: string, data: any, authHeader?: string) {
    return this.proxyRequest('PUT', `/api/offers/${id}`, data, authHeader);
  }

  async deleteOffer(id: string, authHeader?: string) {
    return this.proxyRequest('DELETE', `/api/offers/${id}`, undefined, authHeader);
  }
}
