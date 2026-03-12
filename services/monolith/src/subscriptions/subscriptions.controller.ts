import { Controller, Post, Get, Patch, Delete, Param, Body, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';

@ApiTags('Subscriptions')
@ApiBearerAuth('access-token')
@Controller('api/subscriptions')
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new subscription' })
  @ApiResponse({
    status: 201,
    description: 'Subscription created',
    type: SubscriptionResponseDto,
  })
  async create(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @Request() req: any,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionsService.create(req.user?.id, createSubscriptionDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiResponse({
    status: 200,
    description: 'Subscription found',
    type: SubscriptionResponseDto,
  })
  async findById(@Param('id') id: string): Promise<SubscriptionResponseDto> {
    return this.subscriptionsService.findById(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subscriptions for current user' })
  @ApiResponse({
    status: 200,
    description: 'List of subscriptions',
    type: [SubscriptionResponseDto],
  })
  async findByUser(@Request() req: any): Promise<SubscriptionResponseDto[]> {
    return this.subscriptionsService.findByUserId(req.user?.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription updated',
    type: SubscriptionResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateSubscriptionDto>,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionsService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription cancelled',
    type: SubscriptionResponseDto,
  })
  async cancel(@Param('id') id: string): Promise<SubscriptionResponseDto> {
    return this.subscriptionsService.cancel(id);
  }
}
