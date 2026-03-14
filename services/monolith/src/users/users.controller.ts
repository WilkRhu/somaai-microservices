import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Request,
  Query,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserSyncService } from './services/user-sync.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { OnboardingDto, OnboardingStatusDto } from './dto/onboarding.dto';
import { UserStatsDto } from './dto/user-stats.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { SyncFromAuthDto } from './dto/sync-from-auth.dto';
import { User } from './entities/user.entity';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private userSyncService: UserSyncService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({
    status: 201,
    description: 'User created',
    type: UserResponseDto,
  })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all users (ADMIN)' })
  @ApiResponse({
    status: 200,
    description: 'Users list',
    type: [UserResponseDto],
  })
  async listUsers(
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
  ): Promise<UserResponseDto[]> {
    return this.usersService.listUsers(skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') userId: string): Promise<UserResponseDto> {
    return this.usersService.getUserById(userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user (PUT)' })
  @ApiResponse({
    status: 200,
    description: 'User updated',
    type: UserResponseDto,
  })
  async updateUserFull(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateUser(userId, updateUserDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user (PATCH)' })
  @ApiResponse({
    status: 200,
    description: 'User updated',
    type: UserResponseDto,
  })
  async updateUserPartial(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateUser(userId, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  async deleteUser(@Param('id') userId: string): Promise<{ success: boolean }> {
    await this.usersService.deleteUser(userId);
    return { success: true };
  }

  @Post(':id/avatar')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiResponse({
    status: 200,
    description: 'Avatar uploaded',
    type: UserResponseDto,
  })
  async uploadAvatar(
    @Param('id') userId: string,
    @Body() body: { avatarUrl: string },
  ): Promise<UserResponseDto> {
    return this.usersService.updateAvatar(userId, body.avatarUrl);
  }

  @Get(':id/onboarding/status')
  @ApiOperation({ summary: 'Get onboarding status' })
  @ApiResponse({
    status: 200,
    description: 'Onboarding status',
    type: OnboardingStatusDto,
  })
  async getOnboardingStatus(@Param('id') userId: string): Promise<OnboardingStatusDto> {
    return this.usersService.getOnboardingStatus(userId);
  }

  @Get(':id/purchases')
  @ApiOperation({ summary: 'Get user purchases' })
  @ApiResponse({
    status: 200,
    description: 'User purchases',
  })
  async getUserPurchases(
    @Param('id') userId: string,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
  ): Promise<any> {
    return this.usersService.getUserPurchases(userId, skip, take);
  }

  @Post(':id/onboarding/complete')
  @ApiOperation({ summary: 'Complete onboarding' })
  @ApiResponse({ status: 200, description: 'Onboarding completed' })
  async completeOnboarding(
    @Param('id') userId: string,
    @Body() onboardingDto: OnboardingDto,
  ): Promise<{ success: boolean }> {
    await this.usersService.completeOnboarding(userId, onboardingDto);
    return { success: true };
  }

  @Get('admin/stats')
  @ApiOperation({ summary: 'Get user statistics (ADMIN)' })
  @ApiResponse({
    status: 200,
    description: 'User statistics',
    type: UserStatsDto,
  })
  async getUserStats(): Promise<UserStatsDto> {
    return this.usersService.getUserStats();
  }

  @Get('profile/me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req: any): Promise<UserResponseDto> {
    return this.usersService.getUserProfile(req.user?.id);
  }
}

@ApiTags('Admin')
@Controller('api/admin/users')
export class AdminUsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all users (ADMIN)' })
  @ApiResponse({
    status: 200,
    description: 'Users list',
    type: [UserResponseDto],
  })
  async listAllUsers(
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
    @Query('role') role?: string,
  ): Promise<UserResponseDto[]> {
    return this.usersService.listUsersWithFilter(skip, take, role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (ADMIN)' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserResponseDto,
  })
  async getUserById(@Param('id') userId: string): Promise<UserResponseDto> {
    return this.usersService.getUserById(userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user (ADMIN)' })
  @ApiResponse({
    status: 200,
    description: 'User updated',
    type: UserResponseDto,
  })
  async updateUser(
    @Param('id') userId: string,
    @Body() updateUserDto: AdminUpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.adminUpdateUser(userId, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user (ADMIN)' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  async deleteUser(@Param('id') userId: string): Promise<{ success: boolean }> {
    await this.usersService.deleteUser(userId);
    return { success: true };
  }

  @Put(':id/role')
  @ApiOperation({ summary: 'Update user role (ADMIN)' })
  @ApiResponse({
    status: 200,
    description: 'Role updated',
    type: UserResponseDto,
  })
  async updateUserRole(
    @Param('id') userId: string,
    @Body() body: { role: string },
  ): Promise<UserResponseDto> {
    return this.usersService.updateUserRole(userId, body.role);
  }
}


/**
 * Internal routes for service-to-service communication
 * These routes are protected by X-Internal-Service header
 */
@ApiTags('Internal')
@Controller('api/users/internal')
export class UsersInternalController {
  constructor(private userSyncService: UserSyncService) {}

  /**
   * Sincroniza um usuário criado no auth com o monolith
   * Rota interna protegida por header X-Internal-Service
   */
  @Post('sync-from-auth')
  @ApiOperation({ summary: 'Sync user from auth service (INTERNAL)' })
  @ApiResponse({
    status: 201,
    description: 'User synced successfully',
    type: User,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid internal service header' })
  async syncUserFromAuth(
    @Body() syncDto: SyncFromAuthDto,
    @Headers('x-internal-service') internalService: string,
  ): Promise<User> {
    // Validar header de serviço interno
    if (internalService !== 'auth-service') {
      throw new HttpException(
        'Unauthorized - Invalid internal service',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.userSyncService.syncUserFromAuth(syncDto);
  }

  /**
   * Verifica se um usuário existe no monolith
   * Rota interna protegida por header X-Internal-Service
   */
  @Get('check/:userId')
  @ApiOperation({ summary: 'Check if user exists (INTERNAL)' })
  @ApiResponse({
    status: 200,
    description: 'User exists',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid internal service header' })
  async checkUserExists(
    @Param('userId') userId: string,
    @Headers('x-internal-service') internalService: string,
  ): Promise<{ exists: boolean }> {
    // Validar header de serviço interno
    if (internalService !== 'auth-service') {
      throw new HttpException(
        'Unauthorized - Invalid internal service',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const exists = await this.userSyncService.checkUserExists(userId);

    if (!exists) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return { exists: true };
  }
}
