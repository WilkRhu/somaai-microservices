import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class AuthClient {
  private httpClient: AxiosInstance;

  constructor() {
    this.httpClient = axios.create({
      baseURL: process.env.AUTH_SERVICE_URL || 'http://localhost:3000',
      timeout: 5000,
    });
  }

  async validateToken(token: string) {
    try {
      const response = await this.httpClient.post('/api/auth/verify-token', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Token validation failed: ${error.message}`);
    }
  }

  async login(email: string, password: string) {
    try {
      const response = await this.httpClient.post('/api/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async register(email: string, password: string, firstName: string, lastName: string) {
    try {
      const response = await this.httpClient.post('/api/auth/register', {
        email,
        password,
        firstName,
        lastName,
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      const errorDetails = error.response?.data || {};
      console.error('Registration error details:', errorDetails);
      throw new Error(`Registration failed: ${errorMessage}`);
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const response = await this.httpClient.post('/api/auth/refresh', {
        refreshToken,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  async testSyncUser(userId: string) {
    try {
      const response = await this.httpClient.post(`/api/auth/test-sync/${userId}`, {});
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        response: error.response?.data,
      };
    }
  }
}
