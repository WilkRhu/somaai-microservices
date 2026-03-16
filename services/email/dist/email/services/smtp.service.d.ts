export declare class SmtpService {
    private transporter;
    constructor();
    sendEmail(to: string, subject: string, htmlContent: string, textContent?: string, cc?: string, bcc?: string): Promise<{
        id: string;
        status: string;
    }>;
    sendBulk(recipients: string[], subject: string, htmlContent: string, textContent?: string): Promise<{
        count: number;
        status: string;
    }>;
}
//# sourceMappingURL=smtp.service.d.ts.map