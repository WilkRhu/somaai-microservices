import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DeliveryService } from './delivery.service';

@ApiTags('Delivery')
@Controller('api/delivery')
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  @Post()
  @ApiOperation({ summary: 'Create delivery' })
  async createDelivery(@Body() data: any) {
    return this.deliveryService.createDelivery(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get delivery' })
  async getDelivery(@Param('id') id: string) {
    return this.deliveryService.getDelivery(id);
  }

  @Get()
  @ApiOperation({ summary: 'List deliveries' })
  async listDeliveries(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.deliveryService.listDeliveries(skip, take);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update delivery' })
  async updateDelivery(@Param('id') id: string, @Body() data: any) {
    return this.deliveryService.updateDelivery(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete delivery' })
  async deleteDelivery(@Param('id') id: string) {
    return this.deliveryService.deleteDelivery(id);
  }
}
