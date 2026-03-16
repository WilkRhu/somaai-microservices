export declare enum EmailStatus {
    PENDING = "pending",
    SENT = "sent",
    DELIVERED = "delivered",
    FAILED = "failed",
    BOUNCED = "bounced"
}
export declare class EmailEntity {
    id: string;
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    htmlContent: string;
    textContent?: string;
    templateId?: string;
    templateData?: Record<string, any>;
    status: EmailStatus;
    externalId?: string;
    failureReason?: string;
    opens: number;
    clicks: number;
    createdAt: Date;
    updatedAt: Date;
    sentAt?: Date;
    deliveredAt?: Date;
}
//# sourceMappingURL=email.entity.d.ts.map