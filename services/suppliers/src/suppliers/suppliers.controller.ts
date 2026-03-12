import { Controller, Post, Get, Param, Body, Patch, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierResponseDto } from './dto/supplier-response.dto';
import { Auth } from '../common/decorators/auth.decorator';

@ApiTags('Suppliers')
@ApiBearerAuth('access-token')
@Controller('api/suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Create supplier' })
  @ApiResponse({ status: 201, description: 'Supplier created', type: SupplierResponseDto })
  async createSupplier(@Body() dto: CreateSupplierDto): Promise<SupplierResponseDto> {
    return this.suppliersService.createSupplier(dto);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get supplier by ID' })
  @ApiResponse({ status: 200, description: 'Supplier found', type: SupplierResponseDto })
  async getSupplier(@Param('id') id: string): Promise<SupplierResponseDto> {
    return this.suppliersService.getSupplierById(id);
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'List suppliers' })
  @ApiResponse({ status: 200, description: 'Suppliers list', type: [SupplierResponseDto] })
  async listSuppliers(@Query('name') name?: string): Promise<SupplierResponseDto[]> {
    return this.suppliersService.listSuppliers(name);
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Update supplier' })
  @ApiResponse({ status: 200, description: 'Supplier updated', type: SupplierResponseDto })
  async updateSupplier(
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
  ): Promise<SupplierResponseDto> {
    return this.suppliersService.updateSupplier(id, dto);
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({ summary: 'Delete supplier' })
  @ApiResponse({ status: 200, description: 'Supplier deleted' })
  async deleteSupplier(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.suppliersService.deleteSupplier(id);
    return { success: true };
  }
}
