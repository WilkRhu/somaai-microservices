import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BusinessService {
  private readonly logger = new Logger(BusinessService.name);
  private businessServiceUrl = process.env.BUSINESS_SERVICE_URL || 'http://localhost:3011';
  private uploadServiceUrl = process.env.UPLOAD_SERVICE_URL || 'http://localhost:3008';
  private offersServiceUrl = process.env.OFFERS_SERVICE_URL || 'http://localhost:3014';

  constructor(private httpService: HttpService) {}

  async uploadInventoryImages(itemId: string, files: any[], authHeader?: string) {
    const FormData = require('form-data');
    const urls: string[] = [];

    for (const file of files) {
      try {
        const form = new FormData();
        form.append('file', file.buffer, { filename: file.originalname, contentType: file.mimetype });
        form.append('folder', 'inventory');
        const response = await firstValueFrom(
          this.httpService.post(`${this.uploadServiceUrl}/upload`, form, { headers: form.getHeaders() }),
        );
        urls.push(response.data.url);
      } catch (err) {
        this.logger.error(`Failed to upload image: ${err.message}`);
      }
    }

    return this.proxyRequest('POST', `/api/inventory/${itemId}/images`, { images: urls }, authHeader);
  }

  async proxyRequest(method: string, path: string, data?: any, authHeader?: string) {
    const url = `${this.businessServiceUrl}${path}`;

    this.logger.log(`🔗 [PROXY REQUEST] ${method} ${url}`);
    this.logger.log(`🔗 [PROXY REQUEST] Authorization header: ${authHeader ? authHeader.substring(0, 30) + '...' : 'MISSING'}`);
    if (data) {
      this.logger.log(`🔗 [PROXY REQUEST] Body:`, JSON.stringify(data, null, 2));
    }

    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (authHeader) {
        headers['Authorization'] = authHeader;
        this.logger.log(`🔗 [PROXY REQUEST] Adding Authorization header to request`);
      } else {
        this.logger.warn(`⚠️ [PROXY REQUEST] No authorization header provided`);
      }

      this.logger.log(`🔗 [PROXY REQUEST] Final headers:`, JSON.stringify(headers, null, 2));

      const response = await firstValueFrom(
        this.httpService.request({ method: method.toLowerCase(), url, data, headers }),
      );

      this.logger.log(`✅ [PROXY REQUEST] Success: ${method} ${url}`);
      return response.data;
    } catch (error) {
      this.logger.error(`❌ [PROXY REQUEST] Failed: ${method} ${url}`);
      this.logger.error(`❌ [PROXY REQUEST] Error message: ${error.message}`);
      if (error.response) {
        this.logger.error(`❌ [PROXY REQUEST] Response status: ${error.response.status}`);
        this.logger.error(`❌ [PROXY REQUEST] Response data:`, JSON.stringify(error.response.data, null, 2));
      }

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

  async getDashboard(establishmentId: string, authHeader?: string) {
    return this.proxyRequest('GET', `/api/establishments/${establishmentId}/reports/dashboard`, undefined, authHeader);
  }

  async getSalesReport(establishmentId: string, params: { startDate?: string; endDate?: string; status?: string }, authHeader?: string) {
    const query = new URLSearchParams();
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    if (params.status) query.set('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.proxyRequest('GET', `/api/establishments/${establishmentId}/reports/sales${qs}`, undefined, authHeader);
  }

  async getExpiringInventory(establishmentId: string, daysAhead: number, authHeader?: string) {
    return this.proxyRequest('GET', `/api/establishments/${establishmentId}/inventory/alerts/expiring?daysAhead=${daysAhead}`, undefined, authHeader);
  }

  async getLowStockInventory(establishmentId: string, authHeader?: string) {
    return this.proxyRequest('GET', `/api/establishments/${establishmentId}/inventory/alerts/low-stock`, undefined, authHeader);
  }

  async getEstablishmentInventory(establishmentId: string, params: { search?: string; category?: string; sortBy?: string; sortOrder?: string; page?: number; limit?: number }, authHeader?: string) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.proxyRequest('GET', `/api/establishments/${establishmentId}/inventory${qs}`, undefined, authHeader);
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
    return this.proxyOfferRequest('POST', '/api/offers', data, authHeader);
  }

  async listOffers(skip?: number, take?: number, authHeader?: string) {
    return this.proxyOfferRequest('GET', `/api/offers?skip=${skip || 0}&take=${take || 20}`, undefined, authHeader);
  }

  async getOffer(id: string, authHeader?: string) {
    return this.proxyOfferRequest('GET', `/api/offers/${id}`, undefined, authHeader);
  }

  async updateOffer(id: string, data: any, authHeader?: string) {
    return this.proxyOfferRequest('PUT', `/api/offers/${id}`, data, authHeader);
  }

  async deleteOffer(id: string, authHeader?: string) {
    return this.proxyOfferRequest('DELETE', `/api/offers/${id}`, undefined, authHeader);
  }

  async proxyOfferRequest(method: string, path: string, data?: any, authHeader?: string) {
    const url = `${this.offersServiceUrl}${path}`;

    this.logger.log(`🔗 [PROXY OFFER REQUEST] ${method} ${url}`);

    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (authHeader) {
        headers['Authorization'] = authHeader;
      }

      const response = await firstValueFrom(
        this.httpService.request({ method: method.toLowerCase(), url, data, headers }),
      );

      this.logger.log(`✅ [PROXY OFFER REQUEST] Success: ${method} ${url}`);
      return response.data;
    } catch (error) {
      this.logger.error(`❌ [PROXY OFFER REQUEST] Failed: ${method} ${url}`);
      this.logger.error(`❌ [PROXY OFFER REQUEST] Error message: ${error.message}`);
      if (error.response) {
        this.logger.error(`❌ [PROXY OFFER REQUEST] Response status: ${error.response.status}`);
        this.logger.error(`❌ [PROXY OFFER REQUEST] Response data:`, JSON.stringify(error.response.data, null, 2));
      }

      if (error.response) {
        throw new HttpException(
          error.response.data || error.message,
          error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else if (error.request) {
        throw new HttpException('Offers service not responding', HttpStatus.SERVICE_UNAVAILABLE);
      } else {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
