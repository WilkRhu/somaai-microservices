import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { PurchaseResponseDto, PurchaseSummaryDto } from './dto/purchase-response.dto';

@ApiTags('Purchases')
@Controller('api/users/:userId/purchases')
export class PurchasesController {
  constructor(private purchasesService: PurchasesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new purchase' })
  @ApiResponse({
    status: 201,
    description: 'Purchase created',
    type: PurchaseResponseDto,
  })
  async createPurchase(
    @Param('userId') userId: string,
    @Body() createPurchaseDto: CreatePurchaseDto,
  ): Promise<PurchaseResponseDto> {
    return this.purchasesService.createPurchase({
      ...createPurchaseDto,
      userId,
    });
  }

  @Get()
  @ApiOperation({ summary: 'List user purchases' })
  @ApiResponse({
    status: 200,
    description: 'Purchases list',
  })
  async listPurchases(
    @Param('userId') userId: string,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
  ): Promise<any> {
    return this.purchasesService.listPurchases(userId, skip, take);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get purchase summary' })
  @ApiResponse({
    status: 200,
    description: 'Purchase summary',
    type: PurchaseSummaryDto,
  })
  async getPurchaseSummary(@Param('userId') userId: string): Promise<PurchaseSummaryDto> {
    return this.purchasesService.getPurchaseSummary(userId);
  }

  @Get(':purchaseId')
  @ApiOperation({ summary: 'Get purchase by ID' })
  @ApiResponse({
    status: 200,
    description: 'Purchase found',
    type: PurchaseResponseDto,
  })
  async getPurchaseById(
    @Param('userId') userId: string,
    @Param('purchaseId') purchaseId: string,
  ): Promise<PurchaseResponseDto> {
    return this.purchasesService.getPurchaseById(userId, purchaseId);
  }

  @Put(':purchaseId')
  @ApiOperation({ summary: 'Update purchase' })
  @ApiResponse({
    status: 200,
    description: 'Purchase updated',
    type: PurchaseResponseDto,
  })
  async updatePurchase(
    @Param('userId') userId: string,
    @Param('purchaseId') purchaseId: string,
    @Body() updateData: any,
  ): Promise<PurchaseResponseDto> {
    return this.purchasesService.updatePurchase(userId, purchaseId, updateData);
  }

  @Delete(':purchaseId')
  @ApiOperation({ summary: 'Delete purchase' })
  @ApiResponse({ status: 200, description: 'Purchase deleted' })
  async deletePurchase(
    @Param('userId') userId: string,
    @Param('purchaseId') purchaseId: string,
  ): Promise<{ success: boolean }> {
    await this.purchasesService.deletePurchase(userId, purchaseId);
    return { success: true };
  }
}
