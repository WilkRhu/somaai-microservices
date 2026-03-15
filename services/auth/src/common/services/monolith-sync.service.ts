import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout } from 'rxjs';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class MonolithSyncService {
  private readonly logger = new Logger(MonolithSyncService.name);
  private readonly monolithUrl = process.env.MONOLITH_SERVICE_URL || 'http://localhost:3000';

  constructor(private httpService: HttpService) {}

  async syncUserToMonolith(user: User): Promise<void> {
    const payload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || null,
      avatar: user.avatar || null,
      authProvider: user.authProvider,
      role: user.role,
      emailVerified: user.emailVerified,
    };

    this.logger.log(`🔄 Syncing user ${user.id} to monolith at ${this.monolithUrl}`);
    this.logger.log(`   - Payload:`, JSON.stringify(payload));

    // Try up to 3 times
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        this.logger.log(`   - Attempt ${attempt}/3...`);
        
        const response = await firstValueFrom(
          this.httpService
            .post(`${this.monolithUrl}/api/users/internal/sync-from-auth`, payload, {
              headers: {
                'X-Internal-Service': 'auth-service',
                'Content-Type': 'application/json',
              },
            })
            .pipe(timeout(5000)),
        );

        this.logger.log(`✅ Successfully synced user ${user.id} to monolith`);
        this.logger.log(`   - Response:`, JSON.stringify(response.data));
        return;
      } catch (error: any) {
        const status = error.response?.status ?? error.code ?? 'unknown';
        const data = JSON.stringify(error.response?.data ?? error.message);
        this.logger.error(
          `❌ Sync attempt ${attempt}/3 failed for user ${user.id}: status=${status}, data=${data}`,
        );
        this.logger.error(`   - Error:`, error.message);

        if (attempt < 3) {
          await new Promise((r) => setTimeout(r, 500 * attempt));
        }
      }
    }

    this.logger.error(
      `❌ All sync attempts failed for user ${user.id}. User exists in auth but NOT in monolith.`,
    );
  }

  async syncUserToBusiness(user: User): Promise<void> {
    const businessServiceUrl = process.env.BUSINESS_SERVICE_URL || 'http://localhost:3020';
    const payload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || null,
      avatar: user.avatar || null,
      authProvider: user.authProvider,
      role: user.role,
      emailVerified: user.emailVerified,
    };

    this.logger.log(`🔄 Syncing business user ${user.id} to business service at ${businessServiceUrl}`);
    this.logger.log(`   - Payload:`, JSON.stringify(payload));

    // Try up to 3 times
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        this.logger.log(`   - Attempt ${attempt}/3...`);
        
        const response = await firstValueFrom(
          this.httpService
            .post(`${businessServiceUrl}/api/users/internal/sync-from-auth`, payload, {
              headers: {
                'X-Internal-Service': 'auth-service',
                'Content-Type': 'application/json',
              },
            })
            .pipe(timeout(5000)),
        );

        this.logger.log(`✅ Successfully synced business user ${user.id} to business service`);
        this.logger.log(`   - Response:`, JSON.stringify(response.data));
        return;
      } catch (error: any) {
        const status = error.response?.status ?? error.code ?? 'unknown';
        const data = JSON.stringify(error.response?.data ?? error.message);
        this.logger.error(
          `❌ Business sync attempt ${attempt}/3 failed for user ${user.id}: status=${status}, data=${data}`,
        );
        this.logger.error(`   - Error:`, error.message);

        if (attempt < 3) {
          await new Promise((r) => setTimeout(r, 500 * attempt));
        }
      }
    }

    this.logger.error(
      `❌ All business sync attempts failed for user ${user.id}. User exists in auth but NOT in business service.`,
    );
  }

  async checkUserExistsInMonolith(userId: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.httpService
          .get(`${this.monolithUrl}/api/users/internal/check/${userId}`, {
            headers: { 'X-Internal-Service': 'auth-service' },
          })
          .pipe(timeout(3000)),
      );
      return true;
    } catch (error: any) {
      if (error.response?.status === 404) return false;
      this.logger.error(`Error checking user in monolith: ${error.message}`);
      return false;
    }
  }
}
