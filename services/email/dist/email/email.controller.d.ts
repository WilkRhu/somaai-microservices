import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';
import { SendBulkEmailDto } from './dto/send-bulk-email.dto';
import { EmailStatus } from './enums/email-status.enum';
export declare class EmailController {
    private readonly emailService;
    constructor(emailService: EmailService);
    sendEmail(dto: SendEmailDto): Promise<{
        id: string;
        to: string;
        subject: string;
        status: EmailStatus;
        sentAt?: Date;
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
        sentAt?: Date;
        deliveredAt?: Date;
        opens: number;
        clicks: number;
    }>;
}
//# sourceMappingURL=email.controller.d.ts.map