import { Controller, Post, Get, Param, Body, Patch, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { SaleResponseDto } from './dto/sale-response.dto';
import { Auth } from '../common/decorators/auth.decorator';

@ApiTags('Sales')
@ApiBearerAuth('access-token')
@Controller('api/sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Create sale' })
  @ApiResponse({ status: 201, description: 'Sale created', type: SaleResponseDto })
  async createSale(@Body() dto: CreateSaleDto): Promise<SaleResponseDto> {
    return this.salesService.createSale(dto);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get sale by ID' })
  @ApiResponse({ status: 200, description: 'Sale found', type: SaleResponseDto })
  async getSale(@Param('id') id: string): Promise<SaleResponseDto> {
    return this.salesService.getSaleById(id);
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'List sales' })
  @ApiResponse({ status: 200, description: 'Sales list', type: [SaleResponseDto] })
  async listSales(
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
  ): Promise<SaleResponseDto[]> {
    return this.salesService.listSales(customerId, status);
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Update sale' })
  @ApiResponse({ status: 200, description: 'Sale updated', type: SaleResponseDto })
  async updateSale(
    @Param('id') id: string,
    @Body() dto: UpdateSaleDto,
  ): Promise<SaleResponseDto> {
    return this.salesService.updateSale(id, dto);
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({ summary: 'Delete sale' })
  @ApiResponse({ status: 200, description: 'Sale deleted' })
  async deleteSale(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.salesService.deleteSale(id);
    return { success: true };
  }
}
