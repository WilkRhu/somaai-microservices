import { Controller, Post, Body, BadRequestException, Get, Param, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthClient } from './auth.client';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authClient: AuthClient) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
  })
  async login(@Body() loginDto: { email: string; password: string }) {
    this.logger.log(`🔑 [LOGIN] Attempting login for: ${loginDto.email}`);
    try {
      const result = await this.authClient.login(loginDto.email, loginDto.password);
      this.logger.log(`✅ [LOGIN] Login successful for: ${loginDto.email}`);
      return result;
    } catch (error: any) {
      this.logger.error(`❌ [LOGIN] Login failed: ${error.message}`);
      throw error;
    }
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
  })
  async register(
    @Body() registerDto: any,
  ) {
    this.logger.log(`📝 [REGISTER] Attempting registration for: ${registerDto.email}`);
    this.logger.log(`   - User Type: ${registerDto.userType || 'user'}`);
    
    // Handle both formats: firstName/lastName or name
    let firstName = registerDto.firstName;
    let lastName = registerDto.lastName;

    if (!firstName || !lastName) {
      // Split name if provided
      const nameParts = registerDto.name?.split(' ') || [];
      firstName = firstName || nameParts[0] || '';
      lastName = lastName || nameParts.slice(1).join(' ') || '';
    }

    this.logger.log(`   - Name: ${firstName} ${lastName}`);

    // Validate required fields
    if (!registerDto.email || !registerDto.password || !firstName || !lastName) {
      this.logger.error(`❌ [REGISTER] Missing required fields`);
      throw new BadRequestException('Missing required fields: email, password, firstName, lastName');
    }

    try {
      const result = await this.authClient.register(
        registerDto.email,
        registerDto.password,
        firstName,
        lastName,
        registerDto.userType,
      );
      this.logger.log(`✅ [REGISTER] Registration successful for: ${registerDto.email}`);
      return result;
    } catch (error: any) {
      this.logger.error(`❌ [REGISTER] Registration failed: ${error.message}`);
      throw error;
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
  })
  async refresh(@Body() refreshDto: { refreshToken: string }) {
    this.logger.log(`🔄 [REFRESH] Attempting token refresh...`);
    try {
      const result = await this.authClient.refreshToken(refreshDto.refreshToken);
      this.logger.log(`✅ [REFRESH] Token refreshed successfully`);
      return result;
    } catch (error: any) {
      this.logger.error(`❌ [REFRESH] Token refresh failed: ${error.message}`);
      throw error;
    }
  }

  @Post('test-sync/:userId')
  @ApiOperation({ summary: 'Test sync user to monolith (DEBUG)' })
  @ApiResponse({
    status: 200,
    description: 'Sync test result',
  })
  async testSync(@Param('userId') userId: string) {
    this.logger.log(`🧪 [TEST-SYNC] Testing user sync for: ${userId}`);
    try {
      const result = await this.authClient.testSyncUser(userId);
      this.logger.log(`✅ [TEST-SYNC] Sync test completed for: ${userId}`);
      return result;
    } catch (error: any) {
      this.logger.error(`❌ [TEST-SYNC] Sync test failed: ${error.message}`);
      throw error;
    }
  }
}
