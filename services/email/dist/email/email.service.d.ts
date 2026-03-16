import { SendEmailDto } from './dto/send-email.dto';
import { SendBulkEmailDto } from './dto/send-bulk-email.dto';
import { SendgridService } from './services/sendgrid.service';
import { SmtpService } from './services/smtp.service';
import { EmailStatus } from './enums/email-status.enum';
export declare class EmailService {
    private sendgridService;
    private smtpService;
    private templateLoader;
    private emailStorage;
    constructor(sendgridService: SendgridService, smtpService: SmtpService);
    sendEmail(dto: SendEmailDto): Promise<{
        id: string;
        to: string;
        subject: string;
        status: EmailStatus.SENT | EmailStatus.FAILED;
        sentAt: Date | undefined;
    }>;
    sendBulkEmail(dto: SendBulkEmailDto): Promise<{
        recipientCount: number;
        status: string;
        createdAt: Date;
    }>;
    getEmailStatus(id: string): Promise<{
        id: string;
        to: string;
        subject: string;
        status: EmailStatus;
        sentAt: Date | undefined;
        deliveredAt: Date | undefined;
        opens: number;
        clicks: number;
    }>;
    private renderTemplate;
    private generateId;
}
//# sourceMappingURL=email.service.d.ts.map