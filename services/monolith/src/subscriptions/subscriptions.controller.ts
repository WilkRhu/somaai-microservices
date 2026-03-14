import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Subscriptions')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
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
    @CurrentUser() userId: string,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionsService.create(userId, createSubscriptionDto);
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
  async findByUser(@CurrentUser() userId: string): Promise<SubscriptionResponseDto[]> {
    return this.subscriptionsService.findByUserId(userId);
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
