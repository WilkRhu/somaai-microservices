import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import { SendEmailDto } from './dto/send-email.dto';
import { SendBulkEmailDto } from './dto/send-bulk-email.dto';
import { SendgridService } from './services/sendgrid.service';
import { SmtpService } from './services/smtp.service';
import { TemplateLoader } from './templates/template-loader';
import { EmailStatus } from './enums/email-status.enum';

export interface StoredEmail {
  id: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  status: EmailStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  opens: number;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private templateLoader: TemplateLoader;
  private emailStorage: Map<string, StoredEmail> = new Map();

  constructor(
    private sendgridService: SendgridService,
    private smtpService: SmtpService,
  ) {
    this.templateLoader = new TemplateLoader();
  }

  async sendEmail(dto: SendEmailDto) {
    try {
      let htmlContent: string;
      let textContent: string | undefined;

      const builtInTemplate = this.templateLoader.getTemplate(dto.template, dto.data);

      if (builtInTemplate) {
        htmlContent = builtInTemplate;
        textContent = undefined;
      } else {
        htmlContent = dto.html || '';
        textContent = dto.text;
      }

      const emailId = this.generateEmailId();
      const storedEmail: StoredEmail = {
        id: emailId,
        to: dto.to,
        cc: dto.cc,
        bcc: dto.bcc,
        subject: dto.subject,
        htmlContent,
        textContent,
        status: EmailStatus.PENDING,
        opens: 0,
        clicks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.emailStorage.set(emailId, storedEmail);

      const result = await this.sendViaProvider(dto, htmlContent, textContent);

      if (result.success) {
        storedEmail.status = EmailStatus.SENT;
        storedEmail.sentAt = new Date();
      } else {
        storedEmail.status = EmailStatus.FAILED;
      }

      this.emailStorage.set(emailId, storedEmail);
      return { success: result.success, emailId, messageId: result.messageId };
    } catch (error) {
      this.logger.error(`Failed to send email to ${dto.to}:`, error);
      throw new HttpException(
        `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendBulkEmail(dto: SendBulkEmailDto) {
    const results = [];

    for (const recipient of dto.recipients) {
      try {
        const result = await this.sendEmail({
          to: recipient,
          subject: dto.subject,
          template: dto.template,
          data: dto.data,
          html: dto.html,
          text: dto.text,
        });
        results.push({ recipient, success: result.success, messageId: result.messageId });
      } catch (error) {
        results.push({
          recipient,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      total: dto.recipients.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }

  getEmailStatus(emailId: string) {
    const email = this.emailStorage.get(emailId);
    if (!email) {
      throw new HttpException('Email not found', HttpStatus.NOT_FOUND);
    }
    return email;
  }

  private async sendViaProvider(
    dto: SendEmailDto,
    htmlContent: string,
    textContent?: string,
  ): Promise<{ success: boolean; messageId?: string }> {
    const provider = process.env.EMAIL_PROVIDER || 'smtp';

    if (provider === 'sendgrid') {
      return this.sendgridService.send({
        to: dto.to,
        cc: dto.cc,
        bcc: dto.bcc,
        subject: dto.subject,
        html: htmlContent,
        text: textContent,
      });
    } else {
      return this.smtpService.send({
        to: dto.to,
        cc: dto.cc,
        bcc: dto.bcc,
        subject: dto.subject,
        html: htmlContent,
        text: textContent,
      });
    }
  }

  private generateEmailId(): string {
    return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
