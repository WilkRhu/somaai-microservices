import {
  Controller, Get, Post, Delete, Body, Param, HttpCode, HttpStatus, Request, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MercadopagoService } from './mercadopago.service';
import { AuthGuard } from '../common/guards/auth.guard';

@ApiTags('MercadoPago')
@UseGuards(AuthGuard)
@Controller('api/establishments/mercadopago')
export class MercadopagoController {
  constructor(private readonly mercadopagoService: MercadopagoService) {}

  @Post('connect')
  @ApiOperation({ summary: 'Connect establishment to MercadoPago' })
  async connect(
    @Body() body: { accessToken: string; publicKey: string },
    @Request() req: any,
  ) {
    const establishmentId = req.user?.establishmentId || req.user?.id;
    return this.mercadopagoService.connect(establishmentId, body.accessToken, body.publicKey);
  }

  @Get('integration')
  @ApiOperation({ summary: 'Get MercadoPago integration status' })
  async getIntegration(@Request() req: any) {
    const establishmentId = req.user?.establishmentId || req.user?.id;
    return this.mercadopagoService.getIntegration(establishmentId);
  }

  @Delete('disconnect')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Disconnect MercadoPago integration' })
  async disconnect(@Request() req: any) {
    const establishmentId = req.user?.establishmentId || req.user?.id;
    return this.mercadopagoService.disconnect(establishmentId);
  }

  @Post('payment-preference')
  @ApiOperation({ summary: 'Create payment preference' })
  async createPaymentPreference(@Body() body: any, @Request() req: any) {
    const establishmentId = req.user?.establishmentId || req.user?.id;
    return this.mercadopagoService.createPaymentPreference(establishmentId, body);
  }

  @Get('payment/:paymentId')
  @ApiOperation({ summary: 'Get payment details from MercadoPago' })
  async getPayment(@Param('paymentId') paymentId: string, @Request() req: any) {
    const establishmentId = req.user?.establishmentId || req.user?.id;
    return this.mercadopagoService.getPayment(establishmentId, paymentId);
  }
}
