import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BusinessService {
  private businessServiceUrl = process.env.BUSINESS_SERVICE_URL || 'http://localhost:3011';

  constructor(private httpService: HttpService) {}

  async proxyRequest(method: string, path: string, data?: any, headers?: any) {
    const url = `${this.businessServiceUrl}${path}`;

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method: method.toLowerCase(),
          url,
          data,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        }),
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Establishments
  async createEstablishment(data: any) {
    return this.proxyRequest('POST', '/api/establishments', data);
  }

  async listEstablishments(skip?: number, take?: number) {
    return this.proxyRequest('GET', `/api/establishments?skip=${skip || 0}&take=${take || 20}`);
  }

  async getEstablishment(id: string) {
    return this.proxyRequest('GET', `/api/establishments/${id}`);
  }

  async updateEstablishment(id: string, data: any) {
    return this.proxyRequest('PUT', `/api/establishments/${id}`, data);
  }

  async deleteEstablishment(id: string) {
    return this.proxyRequest('DELETE', `/api/establishments/${id}`);
  }

  // Customers
  async createCustomer(data: any) {
    return this.proxyRequest('POST', '/api/customers', data);
  }

  async listCustomers(skip?: number, take?: number) {
    return this.proxyRequest('GET', `/api/customers?skip=${skip || 0}&take=${take || 20}`);
  }

  async getCustomer(id: string) {
    return this.proxyRequest('GET', `/api/customers/${id}`);
  }

  async updateCustomer(id: string, data: any) {
    return this.proxyRequest('PUT', `/api/customers/${id}`, data);
  }

  async deleteCustomer(id: string) {
    return this.proxyRequest('DELETE', `/api/customers/${id}`);
  }

  // Inventory
  async createInventoryItem(data: any) {
    return this.proxyRequest('POST', '/api/inventory', data);
  }

  async listInventoryItems(skip?: number, take?: number) {
    return this.proxyRequest('GET', `/api/inventory?skip=${skip || 0}&take=${take || 20}`);
  }

  async getInventoryItem(id: string) {
    return this.proxyRequest('GET', `/api/inventory/${id}`);
  }

  async updateInventoryItem(id: string, data: any) {
    return this.proxyRequest('PUT', `/api/inventory/${id}`, data);
  }

  async deleteInventoryItem(id: string) {
    return this.proxyRequest('DELETE', `/api/inventory/${id}`);
  }

  // Sales
  async createSale(data: any) {
    return this.proxyRequest('POST', '/api/sales', data);
  }

  async listSales(skip?: number, take?: number) {
    return this.proxyRequest('GET', `/api/sales?skip=${skip || 0}&take=${take || 20}`);
  }

  async getSale(id: string) {
    return this.proxyRequest('GET', `/api/sales/${id}`);
  }

  async updateSale(id: string, data: any) {
    return this.proxyRequest('PUT', `/api/sales/${id}`, data);
  }

  async deleteSale(id: string) {
    return this.proxyRequest('DELETE', `/api/sales/${id}`);
  }

  // Expenses
  async createExpense(data: any) {
    return this.proxyRequest('POST', '/api/expenses', data);
  }

  async listExpenses(skip?: number, take?: number) {
    return this.proxyRequest('GET', `/api/expenses?skip=${skip || 0}&take=${take || 20}`);
  }

  async getExpense(id: string) {
    return this.proxyRequest('GET', `/api/expenses/${id}`);
  }

  async updateExpense(id: string, data: any) {
    return this.proxyRequest('PUT', `/api/expenses/${id}`, data);
  }

  async deleteExpense(id: string) {
    return this.proxyRequest('DELETE', `/api/expenses/${id}`);
  }

  // Suppliers
  async createSupplier(data: any) {
    return this.proxyRequest('POST', '/api/suppliers', data);
  }

  async listSuppliers(skip?: number, take?: number) {
    return this.proxyRequest('GET', `/api/suppliers?skip=${skip || 0}&take=${take || 20}`);
  }

  async getSupplier(id: string) {
    return this.proxyRequest('GET', `/api/suppliers/${id}`);
  }

  async updateSupplier(id: string, data: any) {
    return this.proxyRequest('PUT', `/api/suppliers/${id}`, data);
  }

  async deleteSupplier(id: string) {
    return this.proxyRequest('DELETE', `/api/suppliers/${id}`);
  }

  // Offers
  async createOffer(data: any) {
    return this.proxyRequest('POST', '/api/offers', data);
  }

  async listOffers(skip?: number, take?: number) {
    return this.proxyRequest('GET', `/api/offers?skip=${skip || 0}&take=${take || 20}`);
  }

  async getOffer(id: string) {
    return this.proxyRequest('GET', `/api/offers/${id}`);
  }

  async updateOffer(id: string, data: any) {
    return this.proxyRequest('PUT', `/api/offers/${id}`, data);
  }

  async deleteOffer(id: string) {
    return this.proxyRequest('DELETE', `/api/offers/${id}`);
  }
}
