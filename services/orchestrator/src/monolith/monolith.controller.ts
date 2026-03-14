import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MonolithService } from './monolith.service';
import { AuthGuard } from '../common/guards/auth.guard';

@ApiTags('Monolith')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('api/monolith')
export class MonolithController {
  private readonly logger = new Logger(MonolithController.name);

  constructor(private monolithService: MonolithService) {}

  // Users
  @Get('users/:userId/purchases')
  @ApiOperation({ summary: 'List user purchases' })
  async getUserPurchases(
    @Param('userId') userId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Request() req?: any,
  ) {
    const authHeader = req?.headers.authorization;
    if (!authHeader) {
      this.logger.warn('Missing authorization header in getUserPurchases');
    }
    // Support both skip/take and page/limit conventions
    const resolvedTake = take ?? limit ?? 20;
    const resolvedSkip = skip ?? (page ? (page - 1) * resolvedTake : 0);
    return this.monolithService.getUserPurchases(userId, resolvedSkip, resolvedTake, authHeader);
  }

  @Post('users/:userId/purchases')
  @ApiOperation({ summary: 'Create purchase for user' })
  async createPurchase(
    @Param('userId') userId: string,
    @Body() data: any,
    @Request() req: any,
  ) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      this.logger.warn('Missing authorization header in createPurchase');
    }
    return this.monolithService.createPurchase(userId, data, authHeader);
  }

  @Get('users/:userId/purchases/:purchaseId')
  @ApiOperation({ summary: 'Get purchase' })
  async getPurchase(
    @Param('userId') userId: string,
    @Param('purchaseId') purchaseId: string,
    @Request() req: any,
  ) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      this.logger.warn('Missing authorization header in getPurchase');
    }
    return this.monolithService.getPurchase(userId, purchaseId, authHeader);
  }

  @Put('users/:userId/purchases/:purchaseId')
  @ApiOperation({ summary: 'Update purchase' })
  async updatePurchase(
    @Param('userId') userId: string,
    @Param('purchaseId') purchaseId: string,
    @Body() data: any,
    @Request() req: any,
  ) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      this.logger.warn('Missing authorization header in updatePurchase');
    }
    return this.monolithService.updatePurchase(userId, purchaseId, data, authHeader);
  }

  @Delete('users/:userId/purchases/:purchaseId')
  @ApiOperation({ summary: 'Delete purchase' })
  async deletePurchase(
    @Param('userId') userId: string,
    @Param('purchaseId') purchaseId: string,
    @Request() req: any,
  ) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      this.logger.warn('Missing authorization header in deletePurchase');
    }
    return this.monolithService.deletePurchase(userId, purchaseId, authHeader);
  }

  // Purchases (direct access)
  @Get('purchases')
  @ApiOperation({ summary: 'List all purchases' })
  async listPurchases(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Request() req?: any,
  ) {
    const authHeader = req?.headers.authorization;
    if (!authHeader) {
      this.logger.warn('Missing authorization header in listPurchases');
    }
    const resolvedTake = take ?? limit ?? 20;
    const resolvedSkip = skip ?? (page ? (page - 1) * resolvedTake : 0);
    return this.monolithService.listPurchases(resolvedSkip, resolvedTake, authHeader);
  }

  @Post('purchases')
  @ApiOperation({ summary: 'Create purchase' })
  async createPurchaseDirectly(
    @Body() data: any,
    @Request() req: any,
  ) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      this.logger.warn('Missing authorization header in createPurchaseDirectly');
    }
    return this.monolithService.createPurchaseDirectly(data, authHeader);
  }

  @Get('purchases/:purchaseId')
  @ApiOperation({ summary: 'Get purchase by ID' })
  async getPurchaseById(
    @Param('purchaseId') purchaseId: string,
    @Request() req: any,
  ) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      this.logger.warn('Missing authorization header in getPurchaseById');
    }
    return this.monolithService.getPurchaseById(purchaseId, authHeader);
  }

  @Put('purchases/:purchaseId')
  @ApiOperation({ summary: 'Update purchase by ID' })
  async updatePurchaseById(
    @Param('purchaseId') purchaseId: string,
    @Body() data: any,
    @Request() req: any,
  ) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      this.logger.warn('Missing authorization header in updatePurchaseById');
    }
    return this.monolithService.updatePurchaseById(purchaseId, data, authHeader);
  }

  @Delete('purchases/:purchaseId')
  @ApiOperation({ summary: 'Delete purchase by ID' })
  async deletePurchaseById(
    @Param('purchaseId') purchaseId: string,
    @Request() req: any,
  ) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      this.logger.warn('Missing authorization header in deletePurchaseById');
    }
    return this.monolithService.deletePurchaseById(purchaseId, authHeader);
  }
}
