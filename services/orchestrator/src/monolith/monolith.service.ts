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
          timeout: 10000,
        }),
      );

      return response.data;
    } catch (error) {
      console.error(`Error calling ${method} ${url}:`, error.message);
      if (error.response) {
        throw new Error(`Monolith service error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error(`Cannot connect to Monolith service at ${this.monolithServiceUrl}. Make sure it's running.`);
      } else {
        throw new Error(`Monolith service error: ${error.message}`);
      }
    }
  }

  // Purchases
  async createPurchase(data: any) {
    return this.proxyRequest('POST', `/api/users/${data.userId}/purchases`, data);
  }

  async createPurchaseForUser(userId: string, data: any) {
    // Não incluir userId no body, apenas na URL
    return this.proxyRequest('POST', `/api/users/${userId}/purchases`, data);
  }

  async getPurchase(id: string) {
    return this.proxyRequest('GET', `/api/purchases/${id}`);
  }

  async listPurchases(skip?: number, take?: number) {
    return this.proxyRequest('GET', `/api/purchases?skip=${skip || 0}&take=${take || 20}`);
  }

  async listUserPurchases(userId: string, skip?: number, take?: number) {
    return this.proxyRequest('GET', `/api/users/${userId}/purchases?skip=${skip || 0}&take=${take || 20}`);
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
