import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BusinessService {
  private businessServiceUrl = process.env.BUSINESS_SERVICE_URL || 'http://localhost:3011';

  constructor(private httpService: HttpService) {}

  async proxyRequest(method: string, path: string, data?: any, authHeader?: string) {
    const url = `${this.businessServiceUrl}${path}`;

    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (authHeader) {
        headers['Authorization'] = authHeader;
      }

      const response = await firstValueFrom(
        this.httpService.request({
          method: method.toLowerCase(),
          url,
          data,
          headers,
        }),
      );

      return response.data;
    } catch (error) {
      throw error;
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
    // Precisa de userId, será passado no data
    return this.proxyRequest('GET', `/api/users/purchases?skip=${skip || 0}&take=${take || 20}`, undefined, authHeader);
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
