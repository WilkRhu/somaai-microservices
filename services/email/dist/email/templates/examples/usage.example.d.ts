/**
 * Exemplos de uso dos templates de email
 * Este arquivo demonstra como usar os diferentes templates disponíveis
 */
export declare class EmailTemplateExamples {
    static getAdminWelcomeExample(): string;
    static getAdminUserCreatedExample(): string;
    static getSupportWelcomeExample(): string;
    static getSupportTicketAssignedExample(): string;
    static getUserWelcomeExample(): string;
    static getUserPasswordResetExample(): string;
    static getLifetimeAccessActivatedExample(): string;
    static getCustomTemplateExample(): string;
}
/**
 * Gera email baseado no tipo de usuário e evento
 */
export declare function generateWelcomeEmail(userName: string, userRole: 'admin' | 'support' | 'user', expirationDate?: string): string;
/**
 * Gera email de notificação para admins
 */
export declare function generateAdminNotification(adminName: string, eventType: 'user_created' | 'ticket_escalated', eventData: any): string;
export declare const EMAIL_CONFIG: {
    URLS: {
        production: string;
        staging: string;
        development: string;
    };
    LOGO: {
        url: string;
        alt: string;
        height: string;
    };
    CONTACT: {
        email: string;
        phone: string;
        website: string;
    };
};
//# sourceMappingURL=usage.example.d.ts.map