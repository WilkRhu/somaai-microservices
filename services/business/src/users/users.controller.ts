import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

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
      return result;
    } catch (error: any) {
      this.logger.error(`❌ [SYNC] Failed to sync user: ${error.message}`);
      throw error;
    }
  }
}
