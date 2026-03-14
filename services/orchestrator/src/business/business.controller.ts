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
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { AuthGuard } from '../common/guards/auth.guard';

@ApiTags('Business')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('api/business')
export class BusinessController {
  private readonly logger = new Logger(BusinessController.name);

  constructor(private businessService: BusinessService) {}

  // Establishments
  @Post('establishments')
  @ApiOperation({ summary: 'Create establishment' })
  async createEstablishment(@Body() data: any, @Request() req: any) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      this.logger.warn('Missing authorization header in createEstablishment');
    }
    return this.businessService.createEstablishment(data, authHeader);
  }

  @Get('establishments')
  @ApiOperation({ summary: 'List establishments' })
  async listEstablishments(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Request() req?: any,
  ) {
    return this.businessService.listEstablishments(skip, take, req?.headers.authorization);
  }

  @Get('establishments/:id')
  @ApiOperation({ summary: 'Get establishment' })
  async getEstablishment(@Param('id') id: string, @Request() req: any) {
    return this.businessService.getEstablishment(id, req.headers.authorization);
  }

  @Patch('establishments/:id')
  @ApiOperation({ summary: 'Update establishment' })
  async updateEstablishment(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    return this.businessService.updateEstablishment(id, data, req.headers.authorization);
  }

  @Delete('establishments/:id')
  @ApiOperation({ summary: 'Delete establishment' })
  async deleteEstablishment(@Param('id') id: string, @Request() req: any) {
    return this.businessService.deleteEstablishment(id, req.headers.authorization);
  }

  // Customers
  @Post('customers')
  @ApiOperation({ summary: 'Create customer' })
  async createCustomer(@Body() data: any, @Request() req: any) {
    return this.businessService.createCustomer(data, req.headers.authorization);
  }

  @Get('customers')
  @ApiOperation({ summary: 'List customers' })
  async listCustomers(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Request() req?: any,
  ) {
    return this.businessService.listCustomers(skip, take, req?.headers.authorization);
  }

  @Get('customers/:id')
  @ApiOperation({ summary: 'Get customer' })
  async getCustomer(@Param('id') id: string, @Request() req: any) {
    return this.businessService.getCustomer(id, req.headers.authorization);
  }

  @Patch('customers/:id')
  @ApiOperation({ summary: 'Update customer' })
  async updateCustomer(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    return this.businessService.updateCustomer(id, data, req.headers.authorization);
  }

  @Delete('customers/:id')
  @ApiOperation({ summary: 'Delete customer' })
  async deleteCustomer(@Param('id') id: string, @Request() req: any) {
    return this.businessService.deleteCustomer(id, req.headers.authorization);
  }

  // Inventory
  @Post('inventory')
  @ApiOperation({ summary: 'Create inventory item' })
  async createInventoryItem(@Body() data: any, @Request() req: any) {
    return this.businessService.createInventoryItem(data, req.headers.authorization);
  }

  @Get('inventory')
  @ApiOperation({ summary: 'List inventory items' })
  async listInventoryItems(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Request() req?: any,
  ) {
    return this.businessService.listInventoryItems(skip, take, req?.headers.authorization);
  }

  @Get('inventory/:id')
  @ApiOperation({ summary: 'Get inventory item' })
  async getInventoryItem(@Param('id') id: string, @Request() req: any) {
    return this.businessService.getInventoryItem(id, req.headers.authorization);
  }

  @Patch('inventory/:id')
  @ApiOperation({ summary: 'Update inventory item' })
  async updateInventoryItem(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    return this.businessService.updateInventoryItem(id, data, req.headers.authorization);
  }

  @Delete('inventory/:id')
  @ApiOperation({ summary: 'Delete inventory item' })
  async deleteInventoryItem(@Param('id') id: string, @Request() req: any) {
    return this.businessService.deleteInventoryItem(id, req.headers.authorization);
  }

  // Sales
  @Post('sales')
  @ApiOperation({ summary: 'Create sale' })
  async createSale(@Body() data: any, @Request() req: any) {
    return this.businessService.createSale(data, req.headers.authorization);
  }

  @Get('sales')
  @ApiOperation({ summary: 'List sales' })
  async listSales(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Request() req?: any,
  ) {
    return this.businessService.listSales(skip, take, req?.headers.authorization);
  }

  @Get('sales/:id')
  @ApiOperation({ summary: 'Get sale' })
  async getSale(@Param('id') id: string, @Request() req: any) {
    return this.businessService.getSale(id, req.headers.authorization);
  }

  @Put('sales/:id')
  @ApiOperation({ summary: 'Update sale' })
  async updateSale(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    return this.businessService.updateSale(id, data, req.headers.authorization);
  }

  @Delete('sales/:id')
  @ApiOperation({ summary: 'Delete sale' })
  async deleteSale(@Param('id') id: string, @Request() req: any) {
    return this.businessService.deleteSale(id, req.headers.authorization);
  }

  // Expenses
  @Post('expenses')
  @ApiOperation({ summary: 'Create expense' })
  async createExpense(@Body() data: any, @Request() req: any) {
    return this.businessService.createExpense(data, req.headers.authorization);
  }

  @Get('expenses')
  @ApiOperation({ summary: 'List expenses' })
  async listExpenses(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Request() req?: any,
  ) {
    return this.businessService.listExpenses(skip, take, req?.headers.authorization);
  }

  @Get('expenses/:id')
  @ApiOperation({ summary: 'Get expense' })
  async getExpense(@Param('id') id: string, @Request() req: any) {
    return this.businessService.getExpense(id, req.headers.authorization);
  }

  @Patch('expenses/:id')
  @ApiOperation({ summary: 'Update expense' })
  async updateExpense(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    return this.businessService.updateExpense(id, data, req.headers.authorization);
  }

  @Delete('expenses/:id')
  @ApiOperation({ summary: 'Delete expense' })
  async deleteExpense(@Param('id') id: string, @Request() req: any) {
    return this.businessService.deleteExpense(id, req.headers.authorization);
  }

  // Suppliers
  @Post('suppliers')
  @ApiOperation({ summary: 'Create supplier' })
  async createSupplier(@Body() data: any, @Request() req: any) {
    return this.businessService.createSupplier(data, req.headers.authorization);
  }

  @Get('suppliers')
  @ApiOperation({ summary: 'List suppliers' })
  async listSuppliers(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Request() req?: any,
  ) {
    return this.businessService.listSuppliers(skip, take, req?.headers.authorization);
  }

  @Get('suppliers/:id')
  @ApiOperation({ summary: 'Get supplier' })
  async getSupplier(@Param('id') id: string, @Request() req: any) {
    return this.businessService.getSupplier(id, req.headers.authorization);
  }

  @Patch('suppliers/:id')
  @ApiOperation({ summary: 'Update supplier' })
  async updateSupplier(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    return this.businessService.updateSupplier(id, data, req.headers.authorization);
  }

  @Delete('suppliers/:id')
  @ApiOperation({ summary: 'Delete supplier' })
  async deleteSupplier(@Param('id') id: string, @Request() req: any) {
    return this.businessService.deleteSupplier(id, req.headers.authorization);
  }

  // Offers
  @Post('offers')
  @ApiOperation({ summary: 'Create offer' })
  async createOffer(@Body() data: any, @Request() req: any) {
    return this.businessService.createOffer(data, req.headers.authorization);
  }

  @Get('offers')
  @ApiOperation({ summary: 'List offers' })
  async listOffers(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Request() req?: any,
  ) {
    return this.businessService.listOffers(skip, take, req?.headers.authorization);
  }

  @Get('offers/:id')
  @ApiOperation({ summary: 'Get offer' })
  async getOffer(@Param('id') id: string, @Request() req: any) {
    return this.businessService.getOffer(id, req.headers.authorization);
  }

  @Patch('offers/:id')
  @ApiOperation({ summary: 'Update offer' })
  async updateOffer(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    return this.businessService.updateOffer(id, data, req.headers.authorization);
  }

  @Delete('offers/:id')
  @ApiOperation({ summary: 'Delete offer' })
  async deleteOffer(@Param('id') id: string, @Request() req: any) {
    return this.businessService.deleteOffer(id, req.headers.authorization);
  }
}
