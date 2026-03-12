import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('api/payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('process')
  @ApiOperation({ summary: 'Process payment' })
  async processPayment(@Body() data: any) {
    return this.paymentsService.processPayment(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment' })
  async getPayment(@Param('id') id: string) {
    return this.paymentsService.getPayment(id);
  }

  @Get()
  @ApiOperation({ summary: 'List payments' })
  async listPayments(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.paymentsService.listPayments(skip, take);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund payment' })
  async refundPayment(@Param('id') id: string, @Body() data: any) {
    return this.paymentsService.refundPayment(id, data);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle payment webhook' })
  async handleWebhook(@Body() data: any) {
    return this.paymentsService.handleWebhook(data);
  }
}
