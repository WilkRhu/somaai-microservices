import { Controller, Post, Get, Param, Body, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DeliveryService } from './delivery.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { DeliveryResponseDto } from './dto/delivery-response.dto';
import { Auth } from '../common/decorators/auth.decorator';

@ApiTags('Delivery')
@ApiBearerAuth('access-token')
@Controller('api/deliveries')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Create delivery' })
  @ApiResponse({ status: 201, description: 'Delivery created', type: DeliveryResponseDto })
  async createDelivery(@Body() dto: CreateDeliveryDto): Promise<DeliveryResponseDto> {
    return this.deliveryService.createDelivery(dto);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get delivery by ID' })
  @ApiResponse({ status: 200, description: 'Delivery found', type: DeliveryResponseDto })
  async getDelivery(@Param('id') id: string): Promise<DeliveryResponseDto> {
    return this.deliveryService.getDeliveryById(id);
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'List deliveries' })
  @ApiResponse({ status: 200, description: 'Deliveries list', type: [DeliveryResponseDto] })
  async listDeliveries(
    @Query('saleId') saleId?: string,
    @Query('status') status?: string,
  ): Promise<DeliveryResponseDto[]> {
    return this.deliveryService.listDeliveries(saleId, status);
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Update delivery' })
  @ApiResponse({ status: 200, description: 'Delivery updated', type: DeliveryResponseDto })
  async updateDelivery(
    @Param('id') id: string,
    @Body() dto: UpdateDeliveryDto,
  ): Promise<DeliveryResponseDto> {
    return this.deliveryService.updateDelivery(id, dto);
  }

  @Post(':id/track')
  @Auth()
  @ApiOperation({ summary: 'Track delivery' })
  @ApiResponse({ status: 200, description: 'Delivery tracked', type: DeliveryResponseDto })
  async trackDelivery(@Param('id') id: string): Promise<DeliveryResponseDto> {
    return this.deliveryService.trackDelivery(id);
  }
}
