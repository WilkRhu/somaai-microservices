import { Controller, Post, Get, Param, Body, Patch, Query } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { DeliveryResponseDto } from './dto/delivery-response.dto';

@Controller('api/deliveries')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post()
  async createDelivery(@Body() dto: CreateDeliveryDto): Promise<DeliveryResponseDto> {
    return this.deliveryService.createDelivery(dto);
  }

  @Get(':id')
  async getDelivery(@Param('id') id: string): Promise<DeliveryResponseDto> {
    return this.deliveryService.getDeliveryById(id);
  }

  @Get()
  async listDeliveries(
    @Query('saleId') saleId?: string,
    @Query('status') status?: string,
  ): Promise<DeliveryResponseDto[]> {
    return this.deliveryService.listDeliveries(saleId, status);
  }

  @Patch(':id')
  async updateDelivery(
    @Param('id') id: string,
    @Body() dto: UpdateDeliveryDto,
  ): Promise<DeliveryResponseDto> {
    return this.deliveryService.updateDelivery(id, dto);
  }

  @Post(':id/track')
  async trackDelivery(@Param('id') id: string): Promise<DeliveryResponseDto> {
    return this.deliveryService.trackDelivery(id);
  }
}
