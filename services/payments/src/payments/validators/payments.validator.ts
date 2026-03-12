import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PaymentStatus } from '../entities/payment.entity';

@Injectable()
export class PaymentsValidator {
  validateRefundAmount(paymentAmount: number, refundAmount: number): boolean {
    if (refundAmount > paymentAmount) {
      throw new HttpException(
        `Refund amount (${refundAmount}) cannot exceed payment amount (${paymentAmount})`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (refundAmount <= 0) {
      throw new HttpException(
        'Refund amount must be greater than 0',
        HttpStatus.BAD_REQUEST,
      );
    }

    return true;
  }

  validateWebhookTimestamp(timestamp: string): boolean {
    try {
      const webhookTime = new Date(timestamp).getTime();
      const currentTime = Date.now();
      const timeDifference = Math.abs(currentTime - webhookTime);

      // Allow 5 minutes difference to prevent replay attacks
      if (timeDifference > 5 * 60 * 1000) {
        throw new HttpException(
          'Webhook timestamp is too old. Possible replay attack.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return true;
    } catch (error) {
      throw new HttpException(
        'Invalid webhook timestamp format',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  validatePaymentStatus(status: string): boolean {
    const validStatuses = Object.values(PaymentStatus);

    if (!validStatuses.includes(status as PaymentStatus)) {
      throw new HttpException(
        `Invalid payment status: ${status}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return true;
  }

  validatePaymentAmount(amount: number): boolean {
    if (amount <= 0) {
      throw new HttpException(
        'Payment amount must be greater than 0',
        HttpStatus.BAD_REQUEST,
      );
    }

    return true;
  }

  validateRefundReason(reason: string): boolean {
    if (!reason || reason.trim().length < 10) {
      throw new HttpException(
        'Refund reason must be at least 10 characters',
        HttpStatus.BAD_REQUEST,
      );
    }

    return true;
  }
}
