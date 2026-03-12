import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { Auth } from '../common/decorators/auth.decorator';

@ApiTags('Payments')
@ApiBearerAuth('access-token')
@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('process')
  @Auth()
  @ApiOperation({ summary: 'Process payment' })
  @ApiResponse({ status: 201, description: 'Payment processed', type: PaymentResponseDto })
  async processPayment(@Body() dto: ProcessPaymentDto): Promise<PaymentResponseDto> {
    return this.paymentsService.processPayment(dto);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment found', type: PaymentResponseDto })
  async getPayment(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.paymentsService.getPaymentById(id);
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'List payments' })
  @ApiResponse({ status: 200, description: 'Payments list', type: [PaymentResponseDto] })
  async listPayments(
    @Query('orderId') orderId?: string,
    @Query('status') status?: string,
  ): Promise<PaymentResponseDto[]> {
    return this.paymentsService.listPayments(orderId, status);
  }

  @Post(':id/refund')
  @Auth()
  @ApiOperation({ summary: 'Refund payment' })
  @ApiResponse({ status: 200, description: 'Payment refunded', type: PaymentResponseDto })
  async refundPayment(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.paymentsService.refundPayment(id);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle payment webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWebhook(@Body() data: any): Promise<{ success: boolean }> {
    await this.paymentsService.handleWebhook(data);
    return { success: true };
  }
}
