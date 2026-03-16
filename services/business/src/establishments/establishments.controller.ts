import { Controller, Get, Post, Body, Param, Put, Delete, Patch, Request, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EstablishmentsService } from './establishments.service';
import { CustomersService } from '../customers/customers.service';
import { InventoryService } from '../inventory/inventory.service';
import { SalesService } from '../sales/sales.service';
import { AuthGuard } from '../common/guards/auth.guard';

@ApiTags('Establishments')
@UseGuards(AuthGuard)
@Controller('api/establishments')
export class EstablishmentsController {
  constructor(
    private readonly establishmentsService: EstablishmentsService,
    private readonly customersService: CustomersService,
    private readonly inventoryService: InventoryService,
    private readonly salesService: SalesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create establishment with optional logo (base64)' })
  async create(@Body() createEstablishmentDto: any, @Request() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.establishmentsService.create(
      { ...createEstablishmentDto, ownerEmail: req.user?.email },
      userId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List establishments' })
  async findAll() {
    return this.establishmentsService.findAll();
  }

  @Get('all')
  @ApiOperation({ summary: 'List all establishments (no pagination)' })
  async findAllNoPagination() {
    return this.establishmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get establishment by ID' })
  async findOne(@Param('id') id: string) {
    return this.establishmentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update establishment' })
  async update(@Param('id') id: string, @Body() updateEstablishmentDto: any) {
    return this.establishmentsService.update(id, updateEstablishmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete establishment' })
  async remove(@Param('id') id: string) {
    return this.establishmentsService.remove(id);
  }

  @Get(':id/reports/dashboard')
  @ApiOperation({ summary: 'Get establishment dashboard' })
  async getDashboard(@Param('id') id: string) {
    return this.establishmentsService.getDashboard(id);
  }

  @Get(':id/reports/sales')
  @ApiOperation({ summary: 'Get sales report for establishment' })
  async getSalesReport(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    return this.establishmentsService.getSalesReport(id, { startDate, endDate, status });
  }

  @Get(':id/loyalty-settings')
  @ApiOperation({ summary: 'Get loyalty settings' })
  async getLoyaltySettings(@Param('id') id: string) {
    return this.establishmentsService.getLoyaltySettings(id);
  }

  @Patch(':id/loyalty-settings')
  @ApiOperation({ summary: 'Update loyalty settings (OWNER only)' })
  async updateLoyaltySettings(
    @Param('id') id: string,
    @Body() body: { loyaltyEnabled?: boolean; loyaltyPointsPerReal?: number },
    @Request() req: any,
  ) {
    return this.establishmentsService.updateLoyaltySettings(id, req.user?.id, body);
  }

  @Get(':id/customers/:customerId/loyalty')
  @ApiOperation({ summary: 'Get customer loyalty points' })
  async getCustomerLoyalty(
    @Param('customerId') customerId: string,
  ) {
    return this.customersService.getLoyalty(customerId);
  }

  @Post(':id/customers/:customerId/loyalty/add')
  @ApiOperation({ summary: 'Add loyalty points to customer' })
  async addLoyaltyPoints(
    @Param('customerId') customerId: string,
    @Body() body: { points: number },
  ) {
    return this.customersService.addPoints(customerId, body.points);
  }

  @Post(':id/customers/:customerId/loyalty/redeem')
  @ApiOperation({ summary: 'Redeem loyalty points from customer' })
  async redeemLoyaltyPoints(
    @Param('customerId') customerId: string,
    @Body() body: { points: number },
  ) {
    return this.customersService.redeemPoints(customerId, body.points);
  }

  @Get(':id/inventory/alerts/expiring')
  @ApiOperation({ summary: 'Get expiring inventory items' })
  async getExpiringInventory(
    @Param('id') id: string,
    @Query('daysAhead') daysAhead?: number,
  ) {
    return this.inventoryService.getExpiringItems(id, daysAhead ? Number(daysAhead) : 30);
  }

  @Get(':id/inventory/alerts/low-stock')
  @ApiOperation({ summary: 'Get low stock inventory items' })
  async getLowStockInventory(@Param('id') id: string) {
    return this.inventoryService.getLowStockItems(id);
  }

  @Get(':id/inventory')
  @ApiOperation({ summary: 'Get inventory items for establishment with filters' })
  async getInventory(
    @Param('id') id: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.inventoryService.findByEstablishment(id, {
      search,
      category,
      sortBy,
      sortOrder,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get(':id/customers')
  @ApiOperation({ summary: 'Get customers for establishment' })
  async getCustomers(@Param('id') id: string) {
    return this.customersService.findByEstablishment(id);
  }

  @Get(':id/sales')
  @ApiOperation({ summary: 'Get sales for establishment with filters' })
  async getSales(
    @Param('id') id: string,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('page') page?: number,
  ) {
    return this.salesService.findByEstablishment(id, {
      limit: limit ? Number(limit) : 20,
      status,
      page: page ? Number(page) : 1,
    });
  }
}
