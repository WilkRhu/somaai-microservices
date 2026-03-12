import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity, PaymentStatus } from './entities/payment.entity';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { MercadopagoService } from './services/mercadopago.service';
import { PaymentsProducerService } from '../kafka/payments.producer';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,
    private mercadopagoService: MercadopagoService,
    private paymentsProducer: PaymentsProducerService,
  ) {}

  /**
   * Process payment
   */
  async processPayment(dto: ProcessPaymentDto): Promise<PaymentResponseDto> {
    try {
      // Create payment entity
      const payment = this.paymentRepository.create({
        orderId: dto.orderId,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        description: dto.description,
        customerEmail: dto.customerEmail,
        customerName: dto.customerName,
        status: PaymentStatus.PENDING,
      });

      await this.paymentRepository.save(payment);

      // Publish initiated event
      await this.paymentsProducer.publishPaymentInitiated({
        id: payment.id,
        orderId: payment.orderId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
      });

      // Update status to processing
      payment.status = PaymentStatus.PROCESSING;
      await this.paymentRepository.save(payment);

      // Process with MercadoPago
      const mpResponse = await this.mercadopagoService.createPayment({
        amount: dto.amount,
        description: dto.description || `Payment for order ${dto.orderId}`,
        orderId: dto.orderId,
        paymentMethod: dto.paymentMethod,
        customerEmail: dto.customerEmail,
      });

      // Update with MercadoPago response
      payment.externalId = mpResponse.id;
      payment.transactionId = mpResponse.id;

      if (mpResponse.status === 'approved') {
        payment.status = PaymentStatus.COMPLETED;
        await this.paymentRepository.save(payment);

        // Publish completed event
        await this.paymentsProducer.publishPaymentCompleted({
          id: payment.id,
          orderId: payment.orderId,
          amount: payment.amount,
          transactionId: payment.transactionId,
        });
      } else {
        payment.status = PaymentStatus.FAILED;
        payment.failureReason = mpResponse.statusDetail;
        await this.paymentRepository.save(payment);

        // Publish failed event
        await this.paymentsProducer.publishPaymentFailed({
          id: payment.id,
          orderId: payment.orderId,
          amount: payment.amount,
          reason: mpResponse.statusDetail,
        });
      }

      return this.mapToDto(payment);
    } catch (error) {
      // Publish failure event
      await this.paymentsProducer.publishPaymentFailed({
        orderId: dto.orderId,
        amount: dto.amount,
        error: error.message,
      });

      throw new HttpException(
        `Payment processing failed: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({ where: { id } });

    if (!payment) {
      throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
    }

    return this.mapToDto(payment);
  }

  /**
   * List payments
   */
  async listPayments(orderId?: string, status?: string): Promise<PaymentResponseDto[]> {
    const query = this.paymentRepository.createQueryBuilder('payment');

    if (orderId) {
      query.where('payment.orderId = :orderId', { orderId });
    }

    if (status) {
      query.andWhere('payment.status = :status', { status });
    }

    const payments = await query.orderBy('payment.createdAt', 'DESC').getMany();

    return payments.map((payment) => this.mapToDto(payment));
  }

  /**
   * Refund payment
   */
  async refundPayment(id: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({ where: { id } });

    if (!payment) {
      throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new HttpException(
        'Only completed payments can be refunded',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Refund in MercadoPago
    await this.mercadopagoService.refundPayment(payment.externalId);

    // Update status
    payment.status = PaymentStatus.REFUNDED;
    await this.paymentRepository.save(payment);

    return this.mapToDto(payment);
  }

  /**
   * Handle webhook from MercadoPago
   */
  async handleWebhook(data: any): Promise<void> {
    // TODO: Implement webhook handling
    console.log('Webhook received:', data);

    // Validate signature
    // const isValid = this.mercadopagoService.validateWebhookSignature(
    //   data.signature,
    //   data.body,
    // );

    // if (!isValid) {
    //   throw new HttpException('Invalid webhook signature', HttpStatus.UNAUTHORIZED);
    // }

    // Update payment status based on webhook data
    // This is a mock implementation
  }

  private mapToDto(payment: PaymentEntity): PaymentResponseDto {
    return {
      id: payment.id,
      orderId: payment.orderId,
      amount: payment.amount,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      externalId: payment.externalId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
