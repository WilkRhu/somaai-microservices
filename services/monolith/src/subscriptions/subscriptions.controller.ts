import { Controller, Post, Get, Patch, Delete, Param, Body, Request } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';

@Controller('api/subscriptions')
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Post()
  async create(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @Request() req,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionsService.create(req.user?.id, createSubscriptionDto);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<SubscriptionResponseDto> {
    return this.subscriptionsService.findById(id);
  }

  @Get()
  async findByUser(@Request() req): Promise<SubscriptionResponseDto[]> {
    return this.subscriptionsService.findByUserId(req.user?.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateSubscriptionDto>,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionsService.update(id, updateData);
  }

  @Delete(':id')
  async cancel(@Param('id') id: string): Promise<SubscriptionResponseDto> {
    return this.subscriptionsService.cancel(id);
  }
}
