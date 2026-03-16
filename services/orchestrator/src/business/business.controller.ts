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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
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
    this.logger.log(`🏢 [CREATE ESTABLISHMENT] Starting...`);
    this.logger.log(`🏢 [CREATE ESTABLISHMENT] Authorization header: ${authHeader || 'MISSING'}`);
    this.logger.log(`🏢 [CREATE ESTABLISHMENT] Request body:`, JSON.stringify(data, null, 2));
    
    if (!authHeader) {
      this.logger.error('❌ Missing authorization header in createEstablishment');
    }
    
    const result = await this.businessService.createEstablishment(data, authHeader);
    this.logger.log(`✅ [CREATE ESTABLISHMENT] Success:`, JSON.stringify(result, null, 2));
    return result;
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

  @Get('establishments/all')
  @ApiOperation({ summary: 'List all establishments (no pagination)' })
  async listAllEstablishments(@Request() req: any) {
    return this.businessService.proxyRequest('GET', '/api/establishments/all', undefined, req.headers.authorization);
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

  @Get('establishments/:id/reports/dashboard')
  @ApiOperation({ summary: 'Get establishment dashboard' })
  async getDashboard(@Param('id') id: string, @Request() req: any) {
    return this.businessService.getDashboard(id, req.headers.authorization);
  }

  @Get('establishments/:id/reports/sales')
  @ApiOperation({ summary: 'Get sales report' })
  async getSalesReport(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Request() req?: any,
  ) {
    return this.businessService.getSalesReport(id, { startDate, endDate, status }, req?.headers.authorization);
  }

  @Post('establishments/:id/inventory')
  @ApiOperation({ summary: 'Create inventory item for establishment' })
  async createEstablishmentInventoryItem(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    return this.businessService.proxyRequest('POST', `/api/inventory`, { ...data, establishmentId: id }, req.headers.authorization);
  }

  @Get('establishments/:id/inventory')
  @ApiOperation({ summary: 'Get inventory items for establishment' })
  async getEstablishmentInventory(
    @Param('id') id: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Request() req?: any,
  ) {
    return this.businessService.getEstablishmentInventory(id, { search, category, sortBy, sortOrder, page, limit }, req?.headers.authorization);
  }

  @Get('establishments/:id/inventory/alerts')
  @ApiOperation({ summary: 'Get inventory alerts (expiring or low-stock)' })
  async getInventoryAlerts(
    @Param('id') id: string,
    @Query('type') type: string,
    @Query('daysAhead') daysAhead: number = 30,
    @Request() req: any,
  ) {
    if (type === 'low-stock') {
      return this.businessService.getLowStockInventory(id, req.headers.authorization);
    }
    return this.businessService.getExpiringInventory(id, daysAhead, req.headers.authorization);
  }

  @Get('establishments/:id/inventory/alerts/expiring')
  @ApiOperation({ summary: 'Get expiring inventory items' })
  async getExpiringInventory(
    @Param('id') id: string,
    @Query('daysAhead') daysAhead: number = 30,
    @Request() req: any,
  ) {
    return this.businessService.getExpiringInventory(id, daysAhead, req.headers.authorization);
  }

  @Get('establishments/:id/inventory/alerts/low-stock')
  @ApiOperation({ summary: 'Get low stock inventory items' })
  async getLowStockInventory(@Param('id') id: string, @Request() req: any) {
    return this.businessService.getLowStockInventory(id, req.headers.authorization);
  }

  @Delete('establishments/:id/inventory/:itemId/images')
  @ApiOperation({ summary: 'Remove images from inventory item' })
  async removeInventoryItemImages(@Param('id') id: string, @Param('itemId') itemId: string, @Body() body: any, @Request() req: any) {
    return this.businessService.proxyRequest('DELETE', `/api/inventory/${itemId}/images`, body, req.headers.authorization);
  }

  @Post('establishments/:id/inventory/:itemId/images')
  @ApiOperation({ summary: 'Add images to inventory item' })
  @UseInterceptors(FilesInterceptor('images', 10, { limits: { fileSize: 10 * 1024 * 1024 } }))
  async addInventoryItemImages(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @UploadedFiles() files: any[],
    @Request() req: any,
  ) {
    return this.businessService.uploadInventoryImages(itemId, files, req.headers.authorization);
  }

  @Get('establishments/:id/inventory/:itemId')
  @ApiOperation({ summary: 'Get inventory item' })
  async getEstablishmentInventoryItem(@Param('id') id: string, @Param('itemId') itemId: string, @Request() req: any) {
    return this.businessService.proxyRequest('GET', `/api/inventory/${itemId}`, undefined, req.headers.authorization);
  }

  @Put('establishments/:id/inventory/:itemId')
  @ApiOperation({ summary: 'Update inventory item' })
  async updateEstablishmentInventoryItem(@Param('id') id: string, @Param('itemId') itemId: string, @Body() data: any, @Request() req: any) {
    return this.businessService.proxyRequest('PUT', `/api/inventory/${itemId}`, data, req.headers.authorization);
  }

  @Patch('establishments/:id/inventory/:itemId')
  @ApiOperation({ summary: 'Patch inventory item' })
  async patchEstablishmentInventoryItem(@Param('id') id: string, @Param('itemId') itemId: string, @Body() data: any, @Request() req: any) {
    return this.businessService.proxyRequest('PATCH', `/api/inventory/${itemId}`, data, req.headers.authorization);
  }

  @Delete('establishments/:id/inventory/:itemId')
  @ApiOperation({ summary: 'Delete inventory item' })
  async deleteEstablishmentInventoryItem(@Param('id') id: string, @Param('itemId') itemId: string, @Request() req: any) {
    return this.businessService.proxyRequest('DELETE', `/api/inventory/${itemId}`, undefined, req.headers.authorization);
  }

  // MercadoPago
  @Post('establishments/mercadopago/connect')
  @ApiOperation({ summary: 'Connect establishment to MercadoPago' })
  async mercadopagoConnect(@Body() data: any, @Request() req: any) {
    return this.businessService.mercadopagoConnect(data, req.headers.authorization);
  }

  @Get('establishments/mercadopago/integration')
  @ApiOperation({ summary: 'Get MercadoPago integration' })
  async mercadopagoGetIntegration(@Request() req: any) {
    return this.businessService.mercadopagoGetIntegration(req.headers.authorization);
  }

  @Delete('establishments/mercadopago/disconnect')
  @ApiOperation({ summary: 'Disconnect MercadoPago' })
  async mercadopagoDisconnect(@Request() req: any) {
    return this.businessService.mercadopagoDisconnect(req.headers.authorization);
  }

  @Post('establishments/mercadopago/payment-preference')
  @ApiOperation({ summary: 'Create MercadoPago payment preference' })
  async mercadopagoCreatePreference(@Body() data: any, @Request() req: any) {
    return this.businessService.mercadopagoCreatePreference(data, req.headers.authorization);
  }

  @Get('establishments/mercadopago/payment/:paymentId')
  @ApiOperation({ summary: 'Get MercadoPago payment details' })
  async mercadopagoGetPayment(@Param('paymentId') paymentId: string, @Request() req: any) {
    return this.businessService.mercadopagoGetPayment(paymentId, req.headers.authorization);
  }

  // Loyalty Settings
  @Get('establishments/:id/loyalty-settings')
  @ApiOperation({ summary: 'Get loyalty settings' })
  async getEstablishmentLoyaltySettings(@Param('id') id: string, @Request() req: any) {
    return this.businessService.getEstablishmentLoyaltySettings(id, req.headers.authorization);
  }

  @Patch('establishments/:id/loyalty-settings')
  @ApiOperation({ summary: 'Update loyalty settings (OWNER only)' })
  async updateEstablishmentLoyaltySettings(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    return this.businessService.updateEstablishmentLoyaltySettings(id, data, req.headers.authorization);
  }

  @Get('establishments/:id/customers/:customerId/loyalty')
  @ApiOperation({ summary: 'Get customer loyalty points' })
  async getCustomerLoyalty(@Param('id') id: string, @Param('customerId') customerId: string, @Request() req: any) {
    return this.businessService.getCustomerLoyalty(id, customerId, req.headers.authorization);
  }

  @Post('establishments/:id/customers/:customerId/loyalty/add')
  @ApiOperation({ summary: 'Add loyalty points to customer' })
  async addCustomerLoyaltyPoints(@Param('id') id: string, @Param('customerId') customerId: string, @Body() data: any, @Request() req: any) {
    return this.businessService.addCustomerLoyaltyPoints(id, customerId, data, req.headers.authorization);
  }

  @Post('establishments/:id/customers/:customerId/loyalty/redeem')
  @ApiOperation({ summary: 'Redeem loyalty points from customer' })
  async redeemCustomerLoyaltyPoints(@Param('id') id: string, @Param('customerId') customerId: string, @Body() data: any, @Request() req: any) {
    return this.businessService.redeemCustomerLoyaltyPoints(id, customerId, data, req.headers.authorization);
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

  @Get('establishments/:id/offers')
  @ApiOperation({ summary: 'Get offers for establishment' })
  async getEstablishmentOffers(
    @Param('id') id: string,
    @Query('isActive') isActive?: string,
    @Request() req?: any,
  ) {
    const qs = isActive !== undefined ? `?isActive=${isActive}` : '';
    return this.businessService.proxyRequest('GET', `/api/offers/establishment/${id}${qs}`, undefined, req?.headers.authorization);
  }

  @Post('establishments/:id/offers')
  @ApiOperation({ summary: 'Create offer for establishment' })
  async createEstablishmentOffer(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    return this.businessService.proxyRequest('POST', `/api/offers`, { ...data, establishmentId: id }, req.headers.authorization);
  }

  @Get('establishments/:id/offers/active-offer/:offerId')
  @ApiOperation({ summary: 'Get active offer for establishment' })
  async getActiveOffer(@Param('id') id: string, @Param('offerId') offerId: string, @Request() req: any) {
    return this.businessService.proxyRequest('GET', `/api/offers/establishment/${id}/active-offer/${offerId}`, undefined, req.headers.authorization);
  }

  @Patch('establishments/:id/offers/:offerId')
  @ApiOperation({ summary: 'Update offer for establishment' })
  async updateEstablishmentOffer(@Param('id') id: string, @Param('offerId') offerId: string, @Body() data: any, @Request() req: any) {
    return this.businessService.proxyRequest('PATCH', `/api/offers/${offerId}`, data, req.headers.authorization);
  }

  @Delete('establishments/:id/offers/:offerId')
  @ApiOperation({ summary: 'Delete offer for establishment' })
  async deleteEstablishmentOffer(@Param('id') id: string, @Param('offerId') offerId: string, @Request() req: any) {
    return this.businessService.proxyRequest('DELETE', `/api/offers/${offerId}`, undefined, req.headers.authorization);
  }

  @Get('establishments/:id/customers')
  @ApiOperation({ summary: 'Get customers for establishment' })
  async getEstablishmentCustomers(@Param('id') id: string, @Request() req: any) {
    return this.businessService.proxyRequest('GET', `/api/establishments/${id}/customers`, undefined, req.headers.authorization);
  }

  @Get('establishments/:id/sales')
  @ApiOperation({ summary: 'Get sales for establishment' })
  async getEstablishmentSales(
    @Param('id') id: string,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Request() req?: any,
  ) {
    const qs = new URLSearchParams();
    if (limit) qs.append('limit', limit.toString());
    if (status) qs.append('status', status);
    if (page) qs.append('page', page.toString());
    const queryString = qs.toString() ? `?${qs.toString()}` : '';
    return this.businessService.proxyRequest('GET', `/api/establishments/${id}/sales${queryString}`, undefined, req?.headers.authorization);
  }

  @Post('establishments/:id/sales')
  @ApiOperation({ summary: 'Create sale for establishment' })
  async createEstablishmentSale(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    // Extrai o userId do token JWT como sellerId
    const sellerId = req.user?.id || req.user?.sub;
    return this.businessService.proxyRequest('POST', `/api/sales`, { ...data, establishmentId: id, sellerId }, req.headers.authorization);
  }

  @Post('establishments/:id/sales/:saleId/cancel')
  @ApiOperation({ summary: 'Cancel sale and restore stock' })
  async cancelSale(@Param('id') id: string, @Param('saleId') saleId: string, @Body() body: any, @Request() req: any) {
    return this.businessService.proxyRequest('POST', `/api/sales/${saleId}/cancel`, { reason: body?.reason }, req.headers.authorization);
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
