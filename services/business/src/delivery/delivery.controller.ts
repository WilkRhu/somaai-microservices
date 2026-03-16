import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DeliveryService } from './delivery.service';
import { AuthGuard } from '../common/guards/auth.guard';

@ApiTags('Delivery')
@UseGuards(AuthGuard)
@Controller('api/establishments/:id/delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  // Zones
  @Post('zones')
  @ApiOperation({ summary: 'Create delivery zone' })
  async createZone(@Param('id') id: string, @Body() body: any) {
    return this.deliveryService.createZone(id, body);
  }

  @Get('zones')
  @ApiOperation({ summary: 'List delivery zones' })
  async getZones(@Param('id') id: string) {
    return this.deliveryService.findAllZones(id);
  }

  @Get('zones/:zoneId')
  @ApiOperation({ summary: 'Get delivery zone' })
  async getZone(@Param('zoneId') zoneId: string) {
    return this.deliveryService.findOneZone(zoneId);
  }

  @Patch('zones/:zoneId')
  @ApiOperation({ summary: 'Update delivery zone' })
  async updateZone(@Param('zoneId') zoneId: string, @Body() body: any) {
    return this.deliveryService.updateZone(zoneId, body);
  }

  @Delete('zones/:zoneId')
  @ApiOperation({ summary: 'Delete delivery zone' })
  async removeZone(@Param('zoneId') zoneId: string) {
    return this.deliveryService.removeZone(zoneId);
  }

  // Orders
  @Post('orders')
  @ApiOperation({ summary: 'Create delivery order' })
  async createOrder(@Param('id') id: string, @Body() body: any) {
    return this.deliveryService.createOrder(id, body);
  }

  @Get('orders')
  @ApiOperation({ summary: 'List delivery orders' })
  async getOrders(
    @Param('id') id: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.deliveryService.findAllOrders(id, {
      status,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get('orders/:orderId')
  @ApiOperation({ summary: 'Get delivery order' })
  async getOrder(@Param('orderId') orderId: string) {
    return this.deliveryService.findOneOrder(orderId);
  }

  @Patch('orders/:orderId/status')
  @ApiOperation({ summary: 'Update delivery order status' })
  async updateOrderStatus(@Param('orderId') orderId: string, @Body() body: any) {
    return this.deliveryService.updateOrderStatus(orderId, body);
  }

  @Patch('orders/:orderId')
  @ApiOperation({ summary: 'Update delivery order' })
  async updateOrder(@Param('orderId') orderId: string, @Body() body: any) {
    return this.deliveryService.updateOrder(orderId, body);
  }

  @Delete('orders/:orderId')
  @ApiOperation({ summary: 'Delete delivery order' })
  async removeOrder(@Param('orderId') orderId: string) {
    return this.deliveryService.removeOrder(orderId);
  }
}
