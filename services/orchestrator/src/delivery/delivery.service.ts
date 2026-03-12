import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DeliveryService {
  private deliveryServiceUrl = process.env.DELIVERY_SERVICE_URL || 'http://localhost:3006';

  constructor(private httpService: HttpService) {}

  async proxyRequest(method: string, path: string, data?: any, headers?: any) {
    const url = `${this.deliveryServiceUrl}${path}`;

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

  // Deliveries
  async createDelivery(data: any) {
    return this.proxyRequest('POST', '/api/deliveries', data);
  }

  async getDelivery(id: string) {
    return this.proxyRequest('GET', `/api/deliveries/${id}`);
  }

  async listDeliveries(skip?: number, take?: number) {
    return this.proxyRequest('GET', `/api/deliveries?skip=${skip || 0}&take=${take || 20}`);
  }

  async updateDelivery(id: string, data: any) {
    return this.proxyRequest('PATCH', `/api/deliveries/${id}`, data);
  }

  async deleteDelivery(id: string) {
    return this.proxyRequest('DELETE', `/api/deliveries/${id}`);
  }
}
