import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FiscalService {
  private fiscalServiceUrl = process.env.FISCAL_SERVICE_URL || 'http://localhost:3008';

  constructor(private httpService: HttpService) {}

  async proxyRequest(method: string, path: string, data?: any, headers?: any) {
    const url = `${this.fiscalServiceUrl}${path}`;

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

  // NFC-e
  async generateNfce(data: any) {
    return this.proxyRequest('POST', '/api/nfce', data);
  }

  async getNfce(id: string) {
    return this.proxyRequest('GET', `/api/nfce/${id}`);
  }

  async listNfces(skip?: number, take?: number) {
    return this.proxyRequest('GET', `/api/nfce?skip=${skip || 0}&take=${take || 20}`);
  }

  async cancelNfce(id: string, data: any) {
    return this.proxyRequest('POST', `/api/nfce/${id}/cancel`, data);
  }

  async signNfce(id: string, data: any) {
    return this.proxyRequest('POST', `/api/nfce/${id}/sign`, data);
  }

  async authorizeNfce(id: string) {
    return this.proxyRequest('POST', `/api/nfce/${id}/authorize`);
  }
}
