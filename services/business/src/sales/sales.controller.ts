import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { SalesService } from './sales.service';

@Controller('api/sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  async create(@Body() createSaleDto: any) {
    return await this.salesService.create(createSaleDto);
  }

  @Get()
  async findAll(@Query('establishmentId') establishmentId: string) {
    return await this.salesService.findAll(establishmentId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.salesService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateSaleDto: any) {
    return await this.salesService.update(id, updateSaleDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.salesService.remove(id);
    return { success: true };
  }

  @Post(':saleId/items')
  async addItem(
    @Param('saleId') saleId: string,
    @Body() createSaleItemDto: any,
  ) {
    return await this.salesService.addItem(saleId, createSaleItemDto);
  }

  @Delete('items/:itemId')
  async removeItem(@Param('itemId') itemId: string) {
    await this.salesService.removeItem(itemId);
    return { success: true };
  }
}
