import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';

@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('process')
  async processPayment(@Body() dto: ProcessPaymentDto): Promise<PaymentResponseDto> {
    return this.paymentsService.processPayment(dto);
  }

  @Get(':id')
  async getPayment(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.paymentsService.getPaymentById(id);
  }

  @Get()
  async listPayments(
    @Query('orderId') orderId?: string,
    @Query('status') status?: string,
  ): Promise<PaymentResponseDto[]> {
    return this.paymentsService.listPayments(orderId, status);
  }

  @Post(':id/refund')
  async refundPayment(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.paymentsService.refundPayment(id);
  }

  @Post('webhook')
  async handleWebhook(@Body() data: any): Promise<{ success: boolean }> {
    await this.paymentsService.handleWebhook(data);
    return { success: true };
  }
}
