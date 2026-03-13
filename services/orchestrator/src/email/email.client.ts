import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EmailClient {
  private emailServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.emailServiceUrl = this.configService.get('EMAIL_SERVICE_URL') || 'http://email:3012';
  }

  async sendEmail(dto: any, headers?: any) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.emailServiceUrl}/email/send`, dto, {
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
      }),
    );
    return response.data;
  }

  async sendBulkEmail(dto: any, headers?: any) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.emailServiceUrl}/email/send-bulk`, dto, {
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
      }),
    );
    return response.data;
  }

  async getEmailStatus(id: string, headers?: any) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.emailServiceUrl}/email/${id}`, {
        headers,
      }),
    );
    return response.data;
  }
}
