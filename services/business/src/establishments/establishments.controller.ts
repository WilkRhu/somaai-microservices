import { Controller, Get, Post, Body, Param, Put, Delete, Patch, Request, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EstablishmentsService } from './establishments.service';
import { CustomersService } from '../customers/customers.service';
import { InventoryService } from '../inventory/inventory.service';
import { SalesService } from '../sales/sales.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { ExpensesService } from '../expenses/expenses.service';
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
    private readonly suppliersService: SuppliersService,
    private readonly expensesService: ExpensesService,
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

  @Get(':id/reports/sales/details')
  @ApiOperation({ summary: 'Get detailed sales report with payment method breakdown' })
  async getSalesDetails(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.establishmentsService.getSalesDetails(id, {
      startDate,
      endDate,
      status: status || undefined,
      paymentMethod: paymentMethod || undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
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

  @Post(':id/customers')
  @ApiOperation({ summary: 'Create customer for establishment' })
  async createCustomer(@Param('id') id: string, @Body() body: any) {
    return this.customersService.create({ ...body, establishmentId: id });
  }

  @Patch(':id/customers/:customerId')
  @ApiOperation({ summary: 'Update customer' })
  async updateCustomer(@Param('customerId') customerId: string, @Body() body: any) {
    return this.customersService.update(customerId, body);
  }

  @Delete(':id/customers/:customerId')
  @ApiOperation({ summary: 'Delete customer' })
  async deleteCustomer(@Param('customerId') customerId: string) {
    await this.customersService.remove(customerId);
    return { success: true };
  }

  @Get(':id/customers')
  @ApiOperation({ summary: 'Get customers for establishment' })
  async getCustomers(@Param('id') id: string) {
    return this.customersService.findByEstablishment(id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get members of establishment' })
  async getMembers(@Param('id') id: string) {
    return this.establishmentsService.getMembers(id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to establishment' })
  async addMember(@Param('id') id: string, @Body() body: { userId: string; role?: string }) {
    return this.establishmentsService.addMember(id, body);
  }

  @Delete(':id/members/:memberId')
  @ApiOperation({ summary: 'Remove member from establishment' })
  async removeMember(@Param('id') id: string, @Param('memberId') memberId: string) {
    return this.establishmentsService.removeMember(id, memberId);
  }

  @Get(':id/employees')
  @ApiOperation({ summary: 'Get employees of establishment' })
  async getEmployees(@Param('id') id: string) {
    return this.establishmentsService.getEmployees(id);
  }

  @Post(':id/employees')
  @ApiOperation({ summary: 'Create employee for establishment' })
  async createEmployee(@Param('id') id: string, @Body() body: any) {
    return this.establishmentsService.createEmployee(id, body);
  }

  @Delete(':id/employees/:userId')
  @ApiOperation({ summary: 'Remove employee from establishment' })
  async removeEmployee(@Param('id') id: string, @Param('userId') userId: string) {
    return this.establishmentsService.removeEmployee(id, userId);
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

  @Post(':id/suppliers')
  @ApiOperation({ summary: 'Create supplier for establishment' })
  async createSupplier(@Param('id') id: string, @Body() body: any) {
    return this.suppliersService.createSupplier({ ...body, establishmentId: id });
  }

  @Get(':id/suppliers')
  @ApiOperation({ summary: 'Get suppliers for establishment' })
  async getSuppliers(@Param('id') id: string) {
    return this.suppliersService.findAllSuppliers(id);
  }

  @Get(':id/suppliers/:supplierId')
  @ApiOperation({ summary: 'Get supplier by ID' })
  async getSupplier(@Param('supplierId') supplierId: string) {
    return this.suppliersService.findOneSupplier(supplierId);
  }

  @Patch(':id/suppliers/:supplierId')
  @ApiOperation({ summary: 'Update supplier' })
  async updateSupplier(@Param('supplierId') supplierId: string, @Body() body: any) {
    return this.suppliersService.updateSupplier(supplierId, body);
  }

  @Delete(':id/suppliers/:supplierId')
  @ApiOperation({ summary: 'Delete supplier' })
  async deleteSupplier(@Param('supplierId') supplierId: string) {
    await this.suppliersService.removeSupplier(supplierId);
    return { success: true };
  }

  @Post(':id/suppliers/:supplierId/purchase-orders')
  @ApiOperation({ summary: 'Create purchase order for supplier' })
  async createPurchaseOrder(@Param('id') id: string, @Param('supplierId') supplierId: string, @Body() body: any, @Request() req: any) {
    return this.suppliersService.createPurchaseOrder({ ...body, establishmentId: id, supplierId, createdById: req.user?.id });
  }

  @Post(':id/suppliers/:supplierId/orders')
  @ApiOperation({ summary: 'Create order for supplier (alias)' })
  async createOrder(@Param('id') id: string, @Param('supplierId') supplierId: string, @Body() body: any, @Request() req: any) {
    return this.suppliersService.createPurchaseOrder({ ...body, establishmentId: id, supplierId, createdById: req.user?.id });
  }

  @Get(':id/purchase-orders')
  @ApiOperation({ summary: 'List all purchase orders for establishment' })
  async getAllPurchaseOrders(@Param('id') id: string, @Query('supplierId') supplierId?: string) {
    return this.suppliersService.findAllPurchaseOrders(id, supplierId);
  }

  @Get(':id/suppliers/:supplierId/purchase-orders')
  @ApiOperation({ summary: 'Get purchase orders for supplier' })
  async getPurchaseOrders(@Param('id') id: string, @Param('supplierId') supplierId: string) {
    return this.suppliersService.findAllPurchaseOrders(id, supplierId);
  }

  @Get(':id/suppliers/:supplierId/orders')
  @ApiOperation({ summary: 'Get orders for supplier (alias)' })
  async getOrders(@Param('id') id: string, @Param('supplierId') supplierId: string) {
    return this.suppliersService.findAllPurchaseOrders(id, supplierId);
  }

  @Get(':id/suppliers/:supplierId/purchase-orders/:poId')
  @ApiOperation({ summary: 'Get purchase order by ID' })
  async getPurchaseOrder(@Param('poId') poId: string) {
    return this.suppliersService.findOnePurchaseOrder(poId);
  }

  @Patch(':id/purchase-orders/:orderId/status')
  @ApiOperation({ summary: 'Update purchase order status' })
  async updatePurchaseOrderStatus(@Param('orderId') orderId: string, @Body() body: any) {
    return this.suppliersService.updatePurchaseOrderStatus(orderId, body);
  }

  @Patch(':id/suppliers/:supplierId/purchase-orders/:poId')
  @ApiOperation({ summary: 'Update purchase order' })
  async updatePurchaseOrder(@Param('poId') poId: string, @Body() body: any) {
    return this.suppliersService.updatePurchaseOrder(poId, body);
  }

  @Delete(':id/suppliers/:supplierId/purchase-orders/:poId')
  @ApiOperation({ summary: 'Delete purchase order' })
  async deletePurchaseOrder(@Param('poId') poId: string) {
    await this.suppliersService.removePurchaseOrder(poId);
    return { success: true };
  }

  @Get(':id/expenses/financial-balance')
  @ApiOperation({ summary: 'Get financial balance for establishment' })
  async getFinancialBalance(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.expensesService.getFinancialBalance(id, { startDate, endDate });
  }

  @Get(':id/expenses')
  @ApiOperation({ summary: 'Get expenses for establishment with filters' })
  async getExpenses(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.expensesService.findAll(id, {
      startDate,
      endDate,
      category,
      status,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Post(':id/expenses')
  @ApiOperation({ summary: 'Create expense for establishment' })
  async createExpense(@Param('id') id: string, @Body() body: any) {
    return this.expensesService.create({ ...body, establishmentId: id });
  }

  @Patch(':id/expenses/:expenseId/mark-as-paid')
  @ApiOperation({ summary: 'Mark expense as paid' })
  async markExpenseAsPaid(
    @Param('expenseId') expenseId: string,
    @Body() body: { paymentDate?: string; paymentMethod?: string },
  ) {
    return this.expensesService.markAsPaid(expenseId, body.paymentDate, body.paymentMethod);
  }

  @Patch(':id/expenses/:expenseId')
  @ApiOperation({ summary: 'Update expense' })
  async updateExpense(@Param('expenseId') expenseId: string, @Body() body: any) {
    return this.expensesService.update(expenseId, body);
  }

  @Delete(':id/expenses/:expenseId')
  @ApiOperation({ summary: 'Delete expense' })
  async deleteExpense(@Param('expenseId') expenseId: string) {
    await this.expensesService.remove(expenseId);
    return { success: true };
  }
}
