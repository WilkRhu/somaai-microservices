import { Controller, Post, Get, Param, Body, Patch, Delete, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { InventoryItemResponseDto } from './dto/inventory-item-response.dto';
import { Auth } from '../common/decorators/auth.decorator';

@ApiTags('Inventory')
@ApiBearerAuth('access-token')
@Controller('api/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('establishments/:establishmentId/alerts/expiring')
  @Auth()
  @ApiOperation({ summary: 'Get expiring inventory items for an establishment' })
  @ApiQuery({ name: 'daysAhead', required: false, type: Number, description: 'Days ahead to check (default: 30)' })
  @ApiResponse({ status: 200, description: 'Expiring items list', type: [InventoryItemResponseDto] })
  async getExpiringItems(
    @Param('establishmentId') establishmentId: string,
    @Query('daysAhead', new DefaultValuePipe(30), ParseIntPipe) daysAhead: number,
  ): Promise<InventoryItemResponseDto[]> {
    return this.inventoryService.getExpiringItems(establishmentId, daysAhead);
  }

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Create inventory item' })
  @ApiResponse({ status: 201, description: 'Item created', type: InventoryItemResponseDto })
  async createItem(@Body() dto: CreateInventoryItemDto): Promise<InventoryItemResponseDto> {
    return this.inventoryService.createItem(dto);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get inventory item by ID' })
  @ApiResponse({ status: 200, description: 'Item found', type: InventoryItemResponseDto })
  async getItem(@Param('id') id: string): Promise<InventoryItemResponseDto> {
    return this.inventoryService.getItemById(id);
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'List inventory items' })
  @ApiResponse({ status: 200, description: 'Items list', type: [InventoryItemResponseDto] })
  async listItems(@Query('productId') productId?: string): Promise<InventoryItemResponseDto[]> {
    return this.inventoryService.listItems(productId);
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Update inventory item' })
  @ApiResponse({ status: 200, description: 'Item updated', type: InventoryItemResponseDto })
  async updateItem(
    @Param('id') id: string,
    @Body() dto: UpdateInventoryItemDto,
  ): Promise<InventoryItemResponseDto> {
    return this.inventoryService.updateItem(id, dto);
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({ summary: 'Delete inventory item' })
  @ApiResponse({ status: 200, description: 'Item deleted' })
  async deleteItem(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.inventoryService.deleteItem(id);
    return { success: true };
  }
}
