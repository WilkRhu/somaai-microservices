export declare class SendgridService {
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
//# sourceMappingURL=sendgrid.service.d.ts.map