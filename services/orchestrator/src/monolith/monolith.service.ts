import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MonolithService {
  private monolithServiceUrl = process.env.MONOLITH_SERVICE_URL || 'http://localhost:3010';

  constructor(private httpService: HttpService) {}

  async proxyRequest(method: string, path: string, data?: any, headers?: any) {
    const url = `${this.monolithServiceUrl}${path}`;

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

  // Purchases
  async createPurchase(data: any) {
    return this.proxyRequest('POST', '/api/purchases', data);
  }

  async getPurchase(id: string) {
    return this.proxyRequest('GET', `/api/purchases/${id}`);
  }

  async listPurchases(skip?: number, take?: number) {
    return this.proxyRequest('GET', `/api/purchases?skip=${skip || 0}&take=${take || 20}`);
  }

  async updatePurchase(id: string, data: any) {
    return this.proxyRequest('PATCH', `/api/purchases/${id}`, data);
  }

  async deletePurchase(id: string) {
    return this.proxyRequest('DELETE', `/api/purchases/${id}`);
  }

  // Users
  async createUser(data: any) {
    return this.proxyRequest('POST', '/api/users', data);
  }

  async getUser(id: string) {
    return this.proxyRequest('GET', `/api/users/${id}`);
  }

  async listUsers(skip?: number, take?: number) {
    return this.proxyRequest('GET', `/api/users?skip=${skip || 0}&take=${take || 20}`);
  }

  async updateUser(id: string, data: any) {
    return this.proxyRequest('PATCH', `/api/users/${id}`, data);
  }

  async deleteUser(id: string) {
    return this.proxyRequest('DELETE', `/api/users/${id}`);
  }
}
