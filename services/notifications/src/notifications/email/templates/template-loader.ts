import { getBusinessWelcomeTemplate } from './business/welcome.template';
import { getAdminWelcomeTemplate } from './admin/welcome.template';
import { getSupportWelcomeTemplate } from './support/welcome.template';
import { getUserWelcomeTemplate } from './user/welcome.template';
import { getUserPasswordResetTemplate } from './user/password-reset.template';
import { getLifetimeAccessActivatedTemplate } from './user/lifetime-access-activated.template';
import { getAdminUserCreatedTemplate } from './admin/user-created.template';
import { getSupportTicketAssignedTemplate } from './support/ticket-assigned.template';

export class TemplateLoader {
  private templates: Map<string, (data?: any) => string> = new Map();

  constructor() {
    this.loadBuiltInTemplates();
  }

  private loadBuiltInTemplates() {
    // Business templates
    this.templates.set('business-welcome', (data) => getBusinessWelcomeTemplate(data?.firstName || 'User'));
    
    // Admin templates
    this.templates.set('admin-welcome', (data) => getAdminWelcomeTemplate(data?.firstName || 'Admin', data?.expirationDate || 'Indefinido'));
    this.templates.set('admin-user-created', (data) => getAdminUserCreatedTemplate(data?.adminName || 'Admin', data?.newUserName || 'User', data?.userRole || 'user'));
    
    // Support templates
    this.templates.set('support-welcome', (data) => getSupportWelcomeTemplate(data?.firstName || 'User', data?.expirationDate || 'Indefinido'));
    this.templates.set('support-ticket-assigned', (data) => getSupportTicketAssignedTemplate(data?.supportName || 'Support', data?.ticketId || '0', data?.ticketTitle || 'Ticket', data?.priority || 'média'));
    
    // User templates
    this.templates.set('user-welcome', (data) => getUserWelcomeTemplate(data?.firstName || 'User'));
    this.templates.set('password-reset', (data) => getUserPasswordResetTemplate(data?.firstName || 'User', data?.resetCode || '000000', data?.expirationMinutes || 15));
    this.templates.set('lifetime-access-activated', (data) => getLifetimeAccessActivatedTemplate(data?.firstName || 'User'));
    
    // Legacy template names for backward compatibility
    this.templates.set('welcome', (data) => getUserWelcomeTemplate(data?.firstName || 'User'));
  }

  getTemplate(templateName: string | undefined, data: any = {}): string | null {
    if (!templateName) return null;

    const templateFn = this.templates.get(templateName);
    if (!templateFn) return null;

    try {
      return templateFn(data);
    } catch (error) {
      console.error(`Error rendering template ${templateName}:`, error);
      return null;
    }
  }
}
