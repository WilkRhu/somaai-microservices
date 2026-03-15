import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class AuthClient {
  private httpClient: AxiosInstance;
  private readonly logger = new Logger(AuthClient.name);

  constructor() {
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3010';
    this.logger.log(`🔐 Initializing AuthClient with URL: ${authServiceUrl}`);
    
    this.httpClient = axios.create({
      baseURL: authServiceUrl,
      timeout: 15000, // Increased from 5s to 15s to allow monolith sync
    });
  }

  async validateToken(token: string) {
    try {
      this.logger.log(`🔍 Validating token...`);
      const response = await this.httpClient.post('/api/auth/verify-token', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      this.logger.log(`✅ Token validated successfully`);
      return response.data;
    } catch (error: any) {
      this.logger.error(`❌ Token validation failed: ${error.message}`);
      throw new Error(`Token validation failed: ${error.message}`);
    }
  }

  async login(email: string, password: string) {
    try {
      this.logger.log(`🔑 Attempting login for: ${email}`);
      const response = await this.httpClient.post('/api/auth/login', {
        email,
        password,
      });
      this.logger.log(`✅ Login successful for: ${email}`);
      return response.data;
    } catch (error: any) {
      this.logger.error(`❌ Login failed for ${email}: ${error.message}`);
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async register(email: string, password: string, firstName: string, lastName: string, userType?: string) {
    try {
      this.logger.log(`📝 Attempting registration for: ${email}`);
      this.logger.log(`   - Name: ${firstName} ${lastName}`);
      this.logger.log(`   - User Type: ${userType || 'user'}`);
      
      const response = await this.httpClient.post('/api/auth/register', {
        email,
        password,
        firstName,
        lastName,
        userType: userType || 'user',
      });
      
      this.logger.log(`✅ Registration successful for: ${email}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      const errorDetails = error.response?.data || {};
      const statusCode = error.response?.status || 'unknown';
      
      this.logger.error(`❌ Registration failed for ${email}`);
      this.logger.error(`   - Status: ${statusCode}`);
      this.logger.error(`   - Message: ${errorMessage}`);
      this.logger.error(`   - Details: ${JSON.stringify(errorDetails)}`);
      
      throw new Error(`Registration failed: ${errorMessage}`);
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      this.logger.log(`🔄 Refreshing token...`);
      const response = await this.httpClient.post('/api/auth/refresh', {
        refreshToken,
      });
      this.logger.log(`✅ Token refreshed successfully`);
      return response.data;
    } catch (error: any) {
      this.logger.error(`❌ Token refresh failed: ${error.message}`);
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  async testSyncUser(userId: string) {
    try {
      this.logger.log(`🧪 Testing user sync for: ${userId}`);
      const response = await this.httpClient.post(`/api/auth/test-sync/${userId}`, {});
      this.logger.log(`✅ User sync test successful for: ${userId}`);
      return response.data;
    } catch (error: any) {
      this.logger.error(`❌ User sync test failed for ${userId}: ${error.message}`);
      return {
        success: false,
        error: error.message,
        response: error.response?.data,
      };
    }
  }
}
