import { Injectable, Logger } from '@nestjs/common';
import twilio from 'twilio';

export interface SmsOptions {
  to: string;
  message: string;
}

@Injectable()
export class SmsProvider {
  private readonly logger = new Logger(SmsProvider.name);
  private client: any;

  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  }

  async send(options: SmsOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const message = await this.client.messages.create({
        body: options.message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: options.to,
      });

      this.logger.log(`SMS sent to ${options.to}, messageId: ${message.sid}`);
      return { success: true, messageId: message.sid };
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${options.to}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
