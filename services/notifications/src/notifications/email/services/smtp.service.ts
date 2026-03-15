import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class SmtpService {
  private readonly logger = new Logger(SmtpService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async send(options: EmailOptions): Promise<{ success: boolean; messageId?: string }> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM_NAME
          ? `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM || 'noreply@somaai.com'}>`
          : (process.env.SMTP_FROM || 'SomaAI <noreply@somaai.com>'),
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      this.logger.log(`Email sent via SMTP to ${options.to}, messageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Failed to send email via SMTP:`, error);
      return { success: false };
    }
  }
}
