import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MonolithService } from './monolith.service';
import * as jwt from 'jsonwebtoken';

@ApiTags('Monolith')
@Controller('api/monolith')
export class MonolithController {
  constructor(private monolithService: MonolithService) {}

  private extractUserIdFromToken(authHeader: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    try {
      const token = authHeader.substring(7);
      const decoded: any = jwt.decode(token);
      return decoded?.sub || null;
    } catch (error) {
      return null;
    }
  }

  // Purchases
  @Post('purchases')
  @ApiOperation({ summary: 'Create purchase' })
  async createPurchase(@Body() data: any, @Headers('authorization') authHeader: string) {
    const userId = this.extractUserIdFromToken(authHeader);
    if (!userId) {
      throw new Error('User ID not found in token');
    }
    return this.monolithService.createPurchase({ ...data, userId });
  }

  @Get('purchases/:id')
  @ApiOperation({ summary: 'Get purchase' })
  async getPurchase(@Param('id') id: string) {
    return this.monolithService.getPurchase(id);
  }

  @Get('purchases')
  @ApiOperation({ summary: 'List purchases' })
  async listPurchases(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.monolithService.listPurchases(skip, take);
  }

  @Get('users/:userId/purchases')
  @ApiOperation({ summary: 'List user purchases' })
  async listUserPurchases(
    @Param('userId') userId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.monolithService.listUserPurchases(userId, skip, take);
  }

  @Post('users/:userId/purchases')
  @ApiOperation({ summary: 'Create user purchase' })
  async createUserPurchase(
    @Param('userId') userId: string,
    @Body() data: any,
  ) {
    // Passar userId para o service, que vai usar na URL
    return this.monolithService.createPurchaseForUser(userId, data);
  }

  @Patch('purchases/:id')
  @ApiOperation({ summary: 'Update purchase' })
  async updatePurchase(@Param('id') id: string, @Body() data: any) {
    return this.monolithService.updatePurchase(id, data);
  }

  @Delete('purchases/:id')
  @ApiOperation({ summary: 'Delete purchase' })
  async deletePurchase(@Param('id') id: string) {
    return this.monolithService.deletePurchase(id);
  }

  // Users
  @Post('users')
  @ApiOperation({ summary: 'Create user' })
  async createUser(@Body() data: any) {
    return this.monolithService.createUser(data);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user' })
  async getUser(@Param('id') id: string) {
    return this.monolithService.getUser(id);
  }

  @Get('users')
  @ApiOperation({ summary: 'List users' })
  async listUsers(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.monolithService.listUsers(skip, take);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user' })
  async updateUser(@Param('id') id: string, @Body() data: any) {
    return this.monolithService.updateUser(id, data);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user' })
  async deleteUser(@Param('id') id: string) {
    return this.monolithService.deleteUser(id);
  }
}
