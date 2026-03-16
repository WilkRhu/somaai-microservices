import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  private readonly notificationsServiceUrl: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.notificationsServiceUrl = this.configService.get('NOTIFICATIONS_SERVICE_URL') || 'http://localhost:3015';
  }

  @Post('internal/sync-from-auth')
  @ApiOperation({ summary: 'Sync user from auth service (INTERNAL)' })
  @ApiResponse({
    status: 201,
    description: 'User synced successfully',
  })
  async syncFromAuth(@Body() userData: any) {
    this.logger.log(`🔄 [SYNC] Syncing user from auth: ${userData.email}`);
    try {
      const result = await this.usersService.syncUserFromAuth(userData);
      this.logger.log(`✅ [SYNC] User synced successfully: ${userData.email}`);

      // Send welcome email via HTTP
      try {
        this.logger.log(`📧 Sending welcome email to: ${userData.email}`);
        const emailPayload = {
          to: userData.email,
          subject: 'Welcome to SomaAI Business',
          template: 'business-welcome',
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
          },
        };
        
        await firstValueFrom(
          this.httpService.post(`${this.notificationsServiceUrl}/email/send`, emailPayload, {
            timeout: 5000,
          }),
        );
        
        this.logger.log(`✅ Welcome email sent successfully to ${userData.email}`);
      } catch (error: any) {
        this.logger.error(`❌ Failed to send welcome email: ${error.message}`);
        // Don't fail the sync if email fails
      }

      return result;
    } catch (error: any) {
      this.logger.error(`❌ [SYNC] Failed to sync user: ${error.message}`);
      throw error;
    }
  }
}
