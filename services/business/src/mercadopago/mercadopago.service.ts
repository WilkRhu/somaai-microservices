import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { MercadopagoIntegration } from './entities/mercadopago-integration.entity';

@Injectable()
export class MercadopagoService {
  private readonly logger = new Logger(MercadopagoService.name);
  private readonly mpApiUrl = 'https://api.mercadopago.com';
  private readonly appUrl = process.env.APP_URL || 'http://localhost:3000';

  constructor(
    @InjectRepository(MercadopagoIntegration)
    private integrationRepository: Repository<MercadopagoIntegration>,
    private httpService: HttpService,
  ) {}

  async connect(establishmentId: string, accessToken: string, publicKey: string) {
    // Verify credentials with MP API
    let merchantData: any = {};
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.mpApiUrl}/v1/account`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      merchantData = response.data;
    } catch (error) {
      throw new BadRequestException('Credenciais inválidas. Verifique o Access Token.');
    }

    let integration = await this.integrationRepository.findOne({ where: { establishmentId } });

    if (integration) {
      integration.accessToken = accessToken;
      integration.publicKey = publicKey;
      integration.isActive = true;
      integration.isVerified = true;
      integration.merchantAccountId = String(merchantData.id || '');
      integration.merchantName = merchantData.first_name
        ? `${merchantData.first_name} ${merchantData.last_name || ''}`.trim()
        : merchantData.nickname || null;
      integration.merchantEmail = merchantData.email || null;
      integration.metadata = { connectedAt: new Date(), syncStatus: 'ok' };
    } else {
      integration = this.integrationRepository.create({
        id: uuidv4(),
        establishmentId,
        accessToken,
        publicKey,
        isActive: true,
        isVerified: true,
        merchantAccountId: String(merchantData.id || ''),
        merchantName: merchantData.first_name
          ? `${merchantData.first_name} ${merchantData.last_name || ''}`.trim()
          : merchantData.nickname || null,
        merchantEmail: merchantData.email || null,
        metadata: { connectedAt: new Date(), syncStatus: 'ok' },
      });
    }

    const saved = await this.integrationRepository.save(integration);
    const { accessToken: _, publicKey: __, ...safeData } = saved as any;
    return safeData;
  }

  async getIntegration(establishmentId: string) {
    const integration = await this.integrationRepository.findOne({ where: { establishmentId } });
    if (!integration) throw new NotFoundException('Integração não encontrada');

    const { accessToken: _, publicKey: __, ...safeData } = integration as any;
    return safeData;
  }

  async disconnect(establishmentId: string) {
    const integration = await this.integrationRepository.findOne({ where: { establishmentId } });
    if (!integration) throw new NotFoundException('Integração não encontrada');

    await this.integrationRepository.delete(integration.id);
  }

  async createPaymentPreference(establishmentId: string, dto: {
    saleId: string;
    items: { id: string; title: string; description?: string; quantity: number; unitPrice: number }[];
    totalAmount: number;
    customerEmail?: string;
    customerName?: string;
    externalReference?: string;
  }) {
    const integration = await this.integrationRepository.findOne({
      where: { establishmentId, isActive: true },
    });
    if (!integration) throw new NotFoundException('Integração ativa não encontrada');

    const body = {
      items: dto.items.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        currency_id: 'BRL',
      })),
      payer: dto.customerEmail ? { email: dto.customerEmail, name: dto.customerName } : undefined,
      external_reference: dto.externalReference || dto.saleId,
      back_urls: {
        success: `${this.appUrl}/payment/success?saleId=${dto.saleId}`,
        failure: `${this.appUrl}/payment/failure?saleId=${dto.saleId}`,
        pending: `${this.appUrl}/payment/pending?saleId=${dto.saleId}`,
      },
      auto_return: 'approved',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.mpApiUrl}/checkout/preferences`, body, {
          headers: { Authorization: `Bearer ${integration.accessToken}` },
        }),
      );

      return {
        preferenceId: response.data.id,
        initPoint: response.data.init_point,
        sandboxInitPoint: response.data.sandbox_init_point,
      };
    } catch (error) {
      this.logger.error(`MP preference error: ${error.message}`);
      throw new BadRequestException('Erro ao criar preferência de pagamento no Mercado Pago');
    }
  }

  async getPayment(establishmentId: string, paymentId: string) {
    const integration = await this.integrationRepository.findOne({
      where: { establishmentId, isActive: true },
    });
    if (!integration) throw new NotFoundException('Integração ativa não encontrada');

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.mpApiUrl}/v1/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${integration.accessToken}` },
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`MP get payment error: ${error.message}`);
      throw new NotFoundException('Pagamento não encontrado no Mercado Pago');
    }
  }
}
