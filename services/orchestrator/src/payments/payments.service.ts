import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PaymentsService {
  private paymentsServiceUrl = process.env.PAYMENTS_SERVICE_URL || 'http://localhost:3005';

  constructor(private httpService: HttpService) {}

  async proxyRequest(method: string, path: string, data?: any, headers?: any) {
    const url = `${this.paymentsServiceUrl}${path}`;

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

  // Payments
  async processPayment(data: any) {
    return this.proxyRequest('POST', '/api/payments/process', data);
  }

  async getPayment(id: string) {
    return this.proxyRequest('GET', `/api/payments/${id}`);
  }

  async listPayments(skip?: number, take?: number) {
    return this.proxyRequest('GET', `/api/payments?skip=${skip || 0}&take=${take || 20}`);
  }

  async refundPayment(id: string, data: any) {
    return this.proxyRequest('POST', `/api/payments/${id}/refund`, data);
  }

  async handleWebhook(data: any) {
    return this.proxyRequest('POST', '/api/payments/webhook', data);
  }
}
