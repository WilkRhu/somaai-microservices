import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SmtpService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string,
    cc?: string,
    bcc?: string
  ): Promise<{ id: string; status: string }> {
    try {
      const info = await this.transporter.sendMail({
        from: `${process.env.SMTP_FROM_NAME || 'SomaAI'} <${process.env.SMTP_FROM || 'noreply@somaai.com'}>`,
        to,
        cc,
        bcc,
        subject,
        html: htmlContent,
        text: textContent,
      });

      return {
        id: info.messageId || 'unknown',
        status: 'sent',
      };
    } catch (error) {
      throw new HttpException(
        `SMTP error: ${error instanceof Error ? error.message : String(error)}`,
        HttpStatus.BAD_GATEWAY
      );
    }
  }

  async sendBulk(
    recipients: string[],
    subject: string,
    htmlContent: string,
    textContent?: string
  ): Promise<{ count: number; status: string }> {
    try {
      for (const recipient of recipients) {
        await this.transporter.sendMail({
          from: `${process.env.SMTP_FROM_NAME || 'SomaAI'} <${process.env.SMTP_FROM || 'noreply@somaai.com'}>`,
          to: recipient,
          subject,
          html: htmlContent,
          text: textContent,
        });
      }

      return {
        count: recipients.length,
        status: 'sent',
      };
    } catch (error) {
      throw new HttpException(
        `SMTP bulk error: ${error instanceof Error ? error.message : String(error)}`,
        HttpStatus.BAD_GATEWAY
      );
    }
  }
}
