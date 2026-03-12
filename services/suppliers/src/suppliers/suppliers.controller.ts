import { Controller, Post, Get, Param, Body, Patch, Delete, Query } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierResponseDto } from './dto/supplier-response.dto';

@Controller('api/suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  async createSupplier(@Body() dto: CreateSupplierDto): Promise<SupplierResponseDto> {
    return this.suppliersService.createSupplier(dto);
  }

  @Get(':id')
  async getSupplier(@Param('id') id: string): Promise<SupplierResponseDto> {
    return this.suppliersService.getSupplierById(id);
  }

  @Get()
  async listSuppliers(@Query('name') name?: string): Promise<SupplierResponseDto[]> {
    return this.suppliersService.listSuppliers(name);
  }

  @Patch(':id')
  async updateSupplier(
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
  ): Promise<SupplierResponseDto> {
    return this.suppliersService.updateSupplier(id, dto);
  }

  @Delete(':id')
  async deleteSupplier(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.suppliersService.deleteSupplier(id);
    return { success: true };
  }
}
