import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import { SendEmailDto } from './dto/send-email.dto';
import { SendBulkEmailDto } from './dto/send-bulk-email.dto';
import { SendgridService } from './services/sendgrid.service';
import { SmtpService } from './services/smtp.service';
import { TemplateLoader } from './templates/template-loader';
import { EmailStatus } from './enums/email-status.enum';

interface StoredEmail {
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

      // Try to load from built-in templates first
      const builtInTemplate = this.templateLoader.getTemplate(dto.template, dto.data);
      
      if (builtInTemplate) {
        htmlContent = builtInTemplate;
        textContent = undefined;
      } else {
        throw new HttpException('Template not found', HttpStatus.NOT_FOUND);
      }

      const emailId = this.generateId();
      const email: StoredEmail = {
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

      this.emailStorage.set(emailId, email);

      try {
        const result = await this.sendgridService.sendEmail(
          dto.to,
          dto.subject,
          htmlContent,
          textContent,
          dto.cc,
          dto.bcc,
        );

        email.status = EmailStatus.SENT;
        email.sentAt = new Date();
        email.updatedAt = new Date();
      } catch (error) {
        try {
          const result = await this.smtpService.sendEmail(
            dto.to,
            dto.subject,
            htmlContent,
            textContent,
            dto.cc,
            dto.bcc,
          );

          email.status = EmailStatus.SENT;
          email.sentAt = new Date();
          email.updatedAt = new Date();
        } catch (smtpError) {
          email.status = EmailStatus.FAILED;
          email.updatedAt = new Date();
        }
      }

      return {
        id: email.id,
        to: email.to,
        subject: email.subject,
        status: email.status,
        sentAt: email.sentAt,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to send email: ${error instanceof Error ? error.message : String(error)}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async sendBulkEmail(dto: SendBulkEmailDto) {
    try {
      let htmlContent: string;
      let textContent: string | undefined;

      // Try to load from built-in templates first
      const builtInTemplate = this.templateLoader.getTemplate(dto.template, dto.data);
      
      if (builtInTemplate) {
        htmlContent = builtInTemplate;
        textContent = undefined;
      } else {
        throw new HttpException('Template not found', HttpStatus.NOT_FOUND);
      }

      try {
        await this.sendgridService.sendBulk(
          dto.recipients,
          dto.subject,
          htmlContent,
          textContent,
        );
      } catch (error) {
        await this.smtpService.sendBulk(
          dto.recipients,
          dto.subject,
          htmlContent,
          textContent,
        );
      }

      for (const recipient of dto.recipients) {
        const emailId = this.generateId();
        const email: StoredEmail = {
          id: emailId,
          to: recipient,
          subject: dto.subject,
          htmlContent,
          textContent,
          status: EmailStatus.SENT,
          sentAt: new Date(),
          opens: 0,
          clicks: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        this.emailStorage.set(emailId, email);
      }

      return {
        recipientCount: dto.recipients.length,
        status: 'queued',
        createdAt: new Date(),
      };
    } catch (error) {
      throw new HttpException(
        `Failed to send bulk email: ${error instanceof Error ? error.message : String(error)}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getEmailStatus(id: string) {
    const email = this.emailStorage.get(id);

    if (!email) {
      throw new HttpException('Email not found', HttpStatus.NOT_FOUND);
    }

    return {
      id: email.id,
      to: email.to,
      subject: email.subject,
      status: email.status,
      sentAt: email.sentAt,
      deliveredAt: email.deliveredAt,
      opens: email.opens,
      clicks: email.clicks,
    };
  }

  private renderTemplate(template: string, data: Record<string, any>): string {
    const compiled = Handlebars.compile(template);
    return compiled(data);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
