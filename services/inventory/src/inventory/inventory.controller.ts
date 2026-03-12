import { Controller, Post, Get, Param, Body, Patch, Delete, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { InventoryItemResponseDto } from './dto/inventory-item-response.dto';

@Controller('api/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  async createItem(@Body() dto: CreateInventoryItemDto): Promise<InventoryItemResponseDto> {
    return this.inventoryService.createItem(dto);
  }

  @Get(':id')
  async getItem(@Param('id') id: string): Promise<InventoryItemResponseDto> {
    return this.inventoryService.getItemById(id);
  }

  @Get()
  async listItems(@Query('productId') productId?: string): Promise<InventoryItemResponseDto[]> {
    return this.inventoryService.listItems(productId);
  }

  @Patch(':id')
  async updateItem(
    @Param('id') id: string,
    @Body() dto: UpdateInventoryItemDto,
  ): Promise<InventoryItemResponseDto> {
    return this.inventoryService.updateItem(id, dto);
  }

  @Delete(':id')
  async deleteItem(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.inventoryService.deleteItem(id);
    return { success: true };
  }
}
