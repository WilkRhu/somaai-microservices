import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class MonolithSyncService {
  private readonly logger = new Logger(MonolithSyncService.name);
  private readonly monolithUrl = process.env.MONOLITH_SERVICE_URL || 'http://localhost:3001';

  constructor(private httpService: HttpService) {}

  /**
   * Sincroniza um usuário criado no auth com o monolith
   * Cria um usuário no monolith com o mesmo ID do auth
   */
  async syncUserToMonolith(user: User): Promise<void> {
    try {
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

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.monolithUrl}/api/users/internal/sync-from-auth`,
          payload,
          {
            headers: {
              'X-Internal-Service': 'auth-service',
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      this.logger.log(
        `Successfully synced user ${user.id} to monolith`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to sync user ${user.id} to monolith: ${error.message}`,
      );
      // Não falhar o registro se a sincronização falhar
      // O usuário foi criado no auth, mesmo que a sincronização falhe
    }
  }

  /**
   * Verifica se um usuário já existe no monolith
   */
  async checkUserExistsInMonolith(userId: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.httpService.get(
          `${this.monolithUrl}/api/users/internal/check/${userId}`,
          {
            headers: {
              'X-Internal-Service': 'auth-service',
            },
          },
        ),
      );
      return true;
    } catch (error) {
      if (error.response?.status === 404) {
        return false;
      }
      this.logger.error(
        `Error checking user existence in monolith: ${error.message}`,
      );
      return false;
    }
  }
}
