import { Controller, Post, Get, Param, Body, Patch, Delete, Query } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { SaleResponseDto } from './dto/sale-response.dto';

@Controller('api/sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  async createSale(@Body() dto: CreateSaleDto): Promise<SaleResponseDto> {
    return this.salesService.createSale(dto);
  }

  @Get(':id')
  async getSale(@Param('id') id: string): Promise<SaleResponseDto> {
    return this.salesService.getSaleById(id);
  }

  @Get()
  async listSales(
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
  ): Promise<SaleResponseDto[]> {
    return this.salesService.listSales(customerId, status);
  }

  @Patch(':id')
  async updateSale(
    @Param('id') id: string,
    @Body() dto: UpdateSaleDto,
  ): Promise<SaleResponseDto> {
    return this.salesService.updateSale(id, dto);
  }

  @Delete(':id')
  async deleteSale(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.salesService.deleteSale(id);
    return { success: true };
  }
}
