import { Controller, Post, Body, BadRequestException, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthClient } from './auth.client';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private authClient: AuthClient) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
  })
  async login(@Body() loginDto: { email: string; password: string }) {
    return this.authClient.login(loginDto.email, loginDto.password);
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
    // Handle both formats: firstName/lastName or name
    let firstName = registerDto.firstName;
    let lastName = registerDto.lastName;

    if (!firstName || !lastName) {
      // Split name if provided
      const nameParts = registerDto.name?.split(' ') || [];
      firstName = firstName || nameParts[0] || '';
      lastName = lastName || nameParts.slice(1).join(' ') || '';
    }

    // Validate required fields
    if (!registerDto.email || !registerDto.password || !firstName || !lastName) {
      throw new BadRequestException('Missing required fields: email, password, firstName, lastName');
    }

    return this.authClient.register(
      registerDto.email,
      registerDto.password,
      firstName,
      lastName,
    );
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
  })
  async refresh(@Body() refreshDto: { refreshToken: string }) {
    return this.authClient.refreshToken(refreshDto.refreshToken);
  }

  @Post('test-sync/:userId')
  @ApiOperation({ summary: 'Test sync user to monolith (DEBUG)' })
  @ApiResponse({
    status: 200,
    description: 'Sync test result',
  })
  async testSync(@Param('userId') userId: string) {
    return this.authClient.testSyncUser(userId);
  }
}
