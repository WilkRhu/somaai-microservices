import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BusinessService } from './business.service';

@ApiTags('Business')
@Controller('api/business')
export class BusinessController {
  constructor(private businessService: BusinessService) {}

  // Establishments
  @Post('establishments')
  @ApiOperation({ summary: 'Create establishment' })
  async createEstablishment(@Body() data: any) {
    return this.businessService.createEstablishment(data);
  }

  @Get('establishments')
  @ApiOperation({ summary: 'List establishments' })
  async listEstablishments(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.businessService.listEstablishments(skip, take);
  }

  @Get('establishments/:id')
  @ApiOperation({ summary: 'Get establishment' })
  async getEstablishment(@Param('id') id: string) {
    return this.businessService.getEstablishment(id);
  }

  @Patch('establishments/:id')
  @ApiOperation({ summary: 'Update establishment' })
  async updateEstablishment(@Param('id') id: string, @Body() data: any) {
    return this.businessService.updateEstablishment(id, data);
  }

  @Delete('establishments/:id')
  @ApiOperation({ summary: 'Delete establishment' })
  async deleteEstablishment(@Param('id') id: string) {
    return this.businessService.deleteEstablishment(id);
  }

  // Customers
  @Post('customers')
  @ApiOperation({ summary: 'Create customer' })
  async createCustomer(@Body() data: any) {
    return this.businessService.createCustomer(data);
  }

  @Get('customers')
  @ApiOperation({ summary: 'List customers' })
  async listCustomers(@Query('skip') skip?: number, @Query('take') take?: number) {
    return this.businessService.listCustomers(skip, take);
  }

  @Get('customers/:id')
  @ApiOperation({ summary: 'Get customer' })
  async getCustomer(@Param('id') id: string) {
    return this.businessService.getCustomer(id);
  }

  @Patch('customers/:id')
  @ApiOperation({ summary: 'Update customer' })
  async updateCustomer(@Param('id') id: string, @Body() data: any) {
    return this.businessService.updateCustomer(id, data);
  }

  @Delete('customers/:id')
  @ApiOperation({ summary: 'Delete customer' })
  async deleteCustomer(@Param('id') id: string) {
    return this.businessService.deleteCustomer(id);
  }

  // Inventory
  @Post('inventory')
  @ApiOperation({ summary: 'Create inventory item' })
  async createInventoryItem(@Body() data: any) {
    return this.businessService.createInventoryItem(data);
  }

  @Get('inventory')
  @ApiOperation({ summary: 'List inventory items' })
  async listInventoryItems(@Query('skip') skip?: number, @Query('take') take?: number) {
    return this.businessService.listInventoryItems(skip, take);
  }

  @Get('inventory/:id')
  @ApiOperation({ summary: 'Get inventory item' })
  async getInventoryItem(@Param('id') id: string) {
    return this.businessService.getInventoryItem(id);
  }

  @Patch('inventory/:id')
  @ApiOperation({ summary: 'Update inventory item' })
  async updateInventoryItem(@Param('id') id: string, @Body() data: any) {
    return this.businessService.updateInventoryItem(id, data);
  }

  @Delete('inventory/:id')
  @ApiOperation({ summary: 'Delete inventory item' })
  async deleteInventoryItem(@Param('id') id: string) {
    return this.businessService.deleteInventoryItem(id);
  }

  // Sales
  @Post('sales')
  @ApiOperation({ summary: 'Create sale' })
  async createSale(@Body() data: any) {
    return this.businessService.createSale(data);
  }

  @Get('sales')
  @ApiOperation({ summary: 'List sales' })
  async listSales(@Query('skip') skip?: number, @Query('take') take?: number) {
    return this.businessService.listSales(skip, take);
  }

  @Get('sales/:id')
  @ApiOperation({ summary: 'Get sale' })
  async getSale(@Param('id') id: string) {
    return this.businessService.getSale(id);
  }

  @Put('sales/:id')
  @ApiOperation({ summary: 'Update sale' })
  async updateSale(@Param('id') id: string, @Body() data: any) {
    return this.businessService.updateSale(id, data);
  }

  @Delete('sales/:id')
  @ApiOperation({ summary: 'Delete sale' })
  async deleteSale(@Param('id') id: string) {
    return this.businessService.deleteSale(id);
  }

  // Expenses
  @Post('expenses')
  @ApiOperation({ summary: 'Create expense' })
  async createExpense(@Body() data: any) {
    return this.businessService.createExpense(data);
  }

  @Get('expenses')
  @ApiOperation({ summary: 'List expenses' })
  async listExpenses(@Query('skip') skip?: number, @Query('take') take?: number) {
    return this.businessService.listExpenses(skip, take);
  }

  @Get('expenses/:id')
  @ApiOperation({ summary: 'Get expense' })
  async getExpense(@Param('id') id: string) {
    return this.businessService.getExpense(id);
  }

  @Patch('expenses/:id')
  @ApiOperation({ summary: 'Update expense' })
  async updateExpense(@Param('id') id: string, @Body() data: any) {
    return this.businessService.updateExpense(id, data);
  }

  @Delete('expenses/:id')
  @ApiOperation({ summary: 'Delete expense' })
  async deleteExpense(@Param('id') id: string) {
    return this.businessService.deleteExpense(id);
  }

  // Suppliers
  @Post('suppliers')
  @ApiOperation({ summary: 'Create supplier' })
  async createSupplier(@Body() data: any) {
    return this.businessService.createSupplier(data);
  }

  @Get('suppliers')
  @ApiOperation({ summary: 'List suppliers' })
  async listSuppliers(@Query('skip') skip?: number, @Query('take') take?: number) {
    return this.businessService.listSuppliers(skip, take);
  }

  @Get('suppliers/:id')
  @ApiOperation({ summary: 'Get supplier' })
  async getSupplier(@Param('id') id: string) {
    return this.businessService.getSupplier(id);
  }

  @Patch('suppliers/:id')
  @ApiOperation({ summary: 'Update supplier' })
  async updateSupplier(@Param('id') id: string, @Body() data: any) {
    return this.businessService.updateSupplier(id, data);
  }

  @Delete('suppliers/:id')
  @ApiOperation({ summary: 'Delete supplier' })
  async deleteSupplier(@Param('id') id: string) {
    return this.businessService.deleteSupplier(id);
  }

  // Offers
  @Post('offers')
  @ApiOperation({ summary: 'Create offer' })
  async createOffer(@Body() data: any) {
    return this.businessService.createOffer(data);
  }

  @Get('offers')
  @ApiOperation({ summary: 'List offers' })
  async listOffers(@Query('skip') skip?: number, @Query('take') take?: number) {
    return this.businessService.listOffers(skip, take);
  }

  @Get('offers/:id')
  @ApiOperation({ summary: 'Get offer' })
  async getOffer(@Param('id') id: string) {
    return this.businessService.getOffer(id);
  }

  @Patch('offers/:id')
  @ApiOperation({ summary: 'Update offer' })
  async updateOffer(@Param('id') id: string, @Body() data: any) {
    return this.businessService.updateOffer(id, data);
  }

  @Delete('offers/:id')
  @ApiOperation({ summary: 'Delete offer' })
  async deleteOffer(@Param('id') id: string) {
    return this.businessService.deleteOffer(id);
  }
}
