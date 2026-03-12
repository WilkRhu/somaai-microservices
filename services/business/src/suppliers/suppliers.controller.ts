import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';

@Controller('api/suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  async createSupplier(@Body() createSupplierDto: any) {
    return await this.suppliersService.createSupplier(createSupplierDto);
  }

  @Get()
  async findAllSuppliers(@Query('establishmentId') establishmentId: string) {
    return await this.suppliersService.findAllSuppliers(establishmentId);
  }

  @Get(':id')
  async findOneSupplier(@Param('id') id: string) {
    return await this.suppliersService.findOneSupplier(id);
  }

  @Patch(':id')
  async updateSupplier(
    @Param('id') id: string,
    @Body() updateSupplierDto: any,
  ) {
    return await this.suppliersService.updateSupplier(id, updateSupplierDto);
  }

  @Delete(':id')
  async removeSupplier(@Param('id') id: string) {
    await this.suppliersService.removeSupplier(id);
    return { success: true };
  }

  @Post('purchase-orders')
  async createPurchaseOrder(@Body() createPurchaseOrderDto: any) {
    return await this.suppliersService.createPurchaseOrder(
      createPurchaseOrderDto,
    );
  }

  @Get('purchase-orders')
  async findAllPurchaseOrders(
    @Query('establishmentId') establishmentId: string,
  ) {
    return await this.suppliersService.findAllPurchaseOrders(establishmentId);
  }

  @Get('purchase-orders/:id')
  async findOnePurchaseOrder(@Param('id') id: string) {
    return await this.suppliersService.findOnePurchaseOrder(id);
  }

  @Patch('purchase-orders/:id')
  async updatePurchaseOrder(
    @Param('id') id: string,
    @Body() updatePurchaseOrderDto: any,
  ) {
    return await this.suppliersService.updatePurchaseOrder(
      id,
      updatePurchaseOrderDto,
    );
  }

  @Delete('purchase-orders/:id')
  async removePurchaseOrder(@Param('id') id: string) {
    await this.suppliersService.removePurchaseOrder(id);
    return { success: true };
  }
}
