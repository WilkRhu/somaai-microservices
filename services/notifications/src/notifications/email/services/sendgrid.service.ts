import { Injectable, Logger } from '@nestjs/common';
import sgMail from '@sendgrid/mail';

interface EmailOptions {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class SendgridService {
  private readonly logger = new Logger(SendgridService.name);

  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
  }

  async send(options: EmailOptions): Promise<{ success: boolean; messageId?: string }> {
    try {
      const msg: any = {
        to: options.to,
        from: process.env.SMTP_FROM || 'noreply@somaai.com',
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      if (options.cc) {
        msg.cc = options.cc;
      }

      if (options.bcc) {
        msg.bcc = options.bcc;
      }

      const response = await sgMail.send(msg);
      this.logger.log(`Email sent via SendGrid to ${options.to}`);
      return { success: true, messageId: response[0].headers['x-message-id'] };
    } catch (error) {
      this.logger.error(`Failed to send email via SendGrid:`, error);
      return { success: false };
    }
  }
}
