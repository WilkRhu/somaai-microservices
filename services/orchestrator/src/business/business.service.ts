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
    return this.proxyRequest('POST', '/establishments', data);
  }

  async listEstablishments(skip?: number, take?: number) {
    return this.proxyRequest('GET', `/establishments?skip=${skip || 0}&take=${take || 20}`);
  }

  async getEstablishment(id: string) {
    return this.proxyRequest('GET', `/establishments/${id}`);
  }

  async updateEstablishment(id: string, data: any) {
    return this.proxyRequest('PATCH', `/establishments/${id}`, data);
  }

  async deleteEstablishment(id: string) {
    return this.proxyRequest('DELETE', `/establishments/${id}`);
  }

  // Customers
  async createCustomer(data: any) {
    return this.proxyRequest('POST', '/customers', data);
  }

  async listCustomers(skip?: number, take?: number) {
    return this.proxyRequest('GET', `/customers?skip=${skip || 0}&take=${take || 20}`);
  }

  async getCustomer(id: string) {
    return this.proxyRequest('GET', `/customers/${id}`);
  }

  async updateCustomer(id: string, data: any) {
    return this.proxyRequest('PATCH', `/customers/${id}`, data);
  }

  async deleteCustomer(id: string) {
    return this.proxyRequest('DELETE', `/customers/${id}`);
  }

  // Inventory
  async createInventoryItem(data: any) {
    return this.proxyRequest('POST', '/inventory', data);
  }

  async listInventoryItems(skip?: number, take?: number) {
    return this.proxyRequest('GET', `/inventory?skip=${skip || 0}&take=${take || 20}`);
  }

  async getInventoryItem(id: string) {
    return this.proxyRequest('GET', `/inventory/${id}`);
  }

  async updateInventoryItem(id: string, data: any) {
    return this.proxyRequest('PATCH', `/inventory/${id}`, data);
  }

  async deleteInventoryItem(id: string) {
    return this.proxyRequest('DELETE', `/inventory/${id}`);
  }

  // Sales
  async createSale(data: any) {
    return this.proxyRequest('POST', '/sales', data);
  }

  async listSales(skip?: number, take?: number) {
    return this.proxyRequest('GET', `/sales?skip=${skip || 0}&take=${take || 20}`);
  }

  async getSale(id: string) {
    return this.proxyRequest('GET', `/sales/${id}`);
  }

  async updateSale(id: string, data: any) {
    return this.proxyRequest('PUT', `/sales/${id}`, data);
  }

  async deleteSale(id: string) {
    return this.proxyRequest('DELETE', `/sales/${id}`);
  }

  // Expenses
  async createExpense(data: any) {
    return this.proxyRequest('POST', '/expenses', data);
  }

  async listExpenses(skip?: number, take?: number) {
    return this.proxyRequest('GET', `/expenses?skip=${skip || 0}&take=${take || 20}`);
  }

  async getExpense(id: string) {
    return this.proxyRequest('GET', `/expenses/${id}`);
  }

  async updateExpense(id: string, data: any) {
    return this.proxyRequest('PATCH', `/expenses/${id}`, data);
  }

  async deleteExpense(id: string) {
    return this.proxyRequest('DELETE', `/expenses/${id}`);
  }

  // Suppliers
  async createSupplier(data: any) {
    return this.proxyRequest('POST', '/suppliers', data);
  }

  async listSuppliers(skip?: number, take?: number) {
    return this.proxyRequest('GET', `/suppliers?skip=${skip || 0}&take=${take || 20}`);
  }

  async getSupplier(id: string) {
    return this.proxyRequest('GET', `/suppliers/${id}`);
  }

  async updateSupplier(id: string, data: any) {
    return this.proxyRequest('PATCH', `/suppliers/${id}`, data);
  }

  async deleteSupplier(id: string) {
    return this.proxyRequest('DELETE', `/suppliers/${id}`);
  }

  // Offers
  async createOffer(data: any) {
    return this.proxyRequest('POST', '/offers', data);
  }

  async listOffers(skip?: number, take?: number) {
    return this.proxyRequest('GET', `/offers?skip=${skip || 0}&take=${take || 20}`);
  }

  async getOffer(id: string) {
    return this.proxyRequest('GET', `/offers/${id}`);
  }

  async updateOffer(id: string, data: any) {
    return this.proxyRequest('PATCH', `/offers/${id}`, data);
  }

  async deleteOffer(id: string) {
    return this.proxyRequest('DELETE', `/offers/${id}`);
  }
}
