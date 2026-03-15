import { Controller, Get, Post, Body, Param, Put, Delete, Patch, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EstablishmentsService } from './establishments.service';
import { CustomersService } from '../customers/customers.service';
import { AuthGuard } from '../common/guards/auth.guard';

@ApiTags('Establishments')
@UseGuards(AuthGuard)
@Controller('api/establishments')
export class EstablishmentsController {
  constructor(
    private readonly establishmentsService: EstablishmentsService,
    private readonly customersService: CustomersService,
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
}
