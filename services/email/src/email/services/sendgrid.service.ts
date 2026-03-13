import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import sgMail from '@sendgrid/mail';

@Injectable()
export class SendgridService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
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
      const msg: any = {
        to,
        from: process.env.SMTP_FROM || 'noreply@somaai.com',
        subject,
        html: htmlContent,
        text: textContent,
      };

      if (cc) msg.cc = cc;
      if (bcc) msg.bcc = bcc;

      const response = await sgMail.send(msg);

      return {
        id: response[0].headers['x-message-id'] || 'unknown',
        status: 'sent',
      };
    } catch (error) {
      throw new HttpException(
        `SendGrid error: ${error instanceof Error ? error.message : String(error)}`,
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
      const msg: any = {
        to: recipients,
        from: process.env.SMTP_FROM || 'noreply@somaai.com',
        subject,
        html: htmlContent,
        text: textContent,
      };

      await sgMail.sendMultiple(msg);

      return {
        count: recipients.length,
        status: 'queued',
      };
    } catch (error) {
      throw new HttpException(
        `SendGrid bulk error: ${error instanceof Error ? error.message : String(error)}`,
        HttpStatus.BAD_GATEWAY
      );
    }
  }
}
