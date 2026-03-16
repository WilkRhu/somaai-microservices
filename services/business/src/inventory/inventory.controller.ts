import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('api/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  async create(@Body() createItemDto: any) {
    return await this.inventoryService.create(createItemDto);
  }

  @Get()
  async findAll(@Query('establishmentId') establishmentId: string) {
    return await this.inventoryService.findAll(establishmentId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.inventoryService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateItemDto: any) {
    return await this.inventoryService.update(id, updateItemDto);
  }

  @Patch(':id')
  async patch(@Param('id') id: string, @Body() updateItemDto: any) {
    return await this.inventoryService.update(id, updateItemDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.inventoryService.remove(id);
    return { success: true };
  }

  @Delete(':id/images')
  async removeImages(@Param('id') id: string, @Body() body: { images: string[] }) {
    return await this.inventoryService.removeImages(id, body.images);
  }

  @Post(':id/images')
  async addImages(@Param('id') id: string, @Body() body: { images: string[] }) {
    return await this.inventoryService.addImages(id, body.images);
  }

  @Post('movements')
  async recordMovement(@Body() createMovementDto: any) {
    return await this.inventoryService.recordMovement(createMovementDto);
  }

  @Get(':itemId/movements')
  async getMovements(@Param('itemId') itemId: string) {
    return await this.inventoryService.getMovements(itemId);
  }
}
