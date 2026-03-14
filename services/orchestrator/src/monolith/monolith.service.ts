import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MonolithService {
  private readonly logger = new Logger(MonolithService.name);
  private monolithServiceUrl = process.env.MONOLITH_SERVICE_URL || 'http://localhost:3000';

  constructor(private httpService: HttpService) {}

  async proxyRequest(method: string, path: string, data?: any, authHeader?: string) {
    const url = `${this.monolithServiceUrl}${path}`;

    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (authHeader) {
        headers['Authorization'] = authHeader;
      } else {
        this.logger.warn(`No authorization header provided for ${method} ${path}`);
      }

      this.logger.debug(`Proxying ${method} ${url} with headers: ${JSON.stringify(Object.keys(headers))}`);
      if (authHeader) {
        this.logger.debug(`Authorization header: ${authHeader.substring(0, 50)}...`);
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
      this.logger.error(`Proxy request failed: ${method} ${url} - ${error.message}`);
      
      if (error.response) {
        // Erro da resposta HTTP
        throw new HttpException(
          error.response.data || error.message,
          error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else if (error.request) {
        // Erro na requisição (sem resposta)
        this.logger.error(`No response from monolith: ${error.message}`);
        throw new HttpException(
          'Monolith service not responding',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      } else {
        // Erro na configuração da requisição
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  // User Purchases
  async getUserPurchases(userId: string, skip?: number, take?: number, authHeader?: string) {
    return this.proxyRequest(
      'GET',
      `/api/users/${userId}/purchases?skip=${skip || 0}&take=${take || 20}`,
      undefined,
      authHeader,
    );
  }

  async createPurchase(userId: string, data: any, authHeader?: string) {
    return this.proxyRequest('POST', `/api/users/${userId}/purchases`, data, authHeader);
  }

  async getPurchase(userId: string, purchaseId: string, authHeader?: string) {
    return this.proxyRequest('GET', `/api/users/${userId}/purchases/${purchaseId}`, undefined, authHeader);
  }

  async updatePurchase(userId: string, purchaseId: string, data: any, authHeader?: string) {
    return this.proxyRequest('PUT', `/api/users/${userId}/purchases/${purchaseId}`, data, authHeader);
  }

  async deletePurchase(userId: string, purchaseId: string, authHeader?: string) {
    return this.proxyRequest('DELETE', `/api/users/${userId}/purchases/${purchaseId}`, undefined, authHeader);
  }

  // Direct Purchases Access
  async listPurchases(skip?: number, take?: number, authHeader?: string) {
    return this.proxyRequest(
      'GET',
      `/api/purchases?skip=${skip || 0}&take=${take || 20}`,
      undefined,
      authHeader,
    );
  }

  async createPurchaseDirectly(data: any, authHeader?: string) {
    return this.proxyRequest('POST', '/api/purchases', data, authHeader);
  }

  async getPurchaseById(purchaseId: string, authHeader?: string) {
    return this.proxyRequest('GET', `/api/purchases/${purchaseId}`, undefined, authHeader);
  }

  async updatePurchaseById(purchaseId: string, data: any, authHeader?: string) {
    return this.proxyRequest('PUT', `/api/purchases/${purchaseId}`, data, authHeader);
  }

  async deletePurchaseById(purchaseId: string, authHeader?: string) {
    return this.proxyRequest('DELETE', `/api/purchases/${purchaseId}`, undefined, authHeader);
  }
}
