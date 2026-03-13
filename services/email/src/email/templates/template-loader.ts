import { getAdminWelcomeTemplate } from './admin/welcome.template';
import { getAdminUserCreatedTemplate } from './admin/user-created.template';
import { getSupportWelcomeTemplate } from './support/welcome.template';
import { getSupportTicketAssignedTemplate } from './support/ticket-assigned.template';
import { getUserWelcomeTemplate } from './user/welcome.template';
import { getUserPasswordResetTemplate } from './user/password-reset.template';
import { getLifetimeAccessActivatedTemplate } from './user/lifetime-access-activated.template';

export class TemplateLoader {
  private templates: Record<string, (data: any) => string> = {
    'admin-welcome': (data) => getAdminWelcomeTemplate(data.userName, data.expirationDate),
    'admin-user-created': (data) => getAdminUserCreatedTemplate(data.adminName, data.newUserName, data.userRole),
    'support-welcome': (data) => getSupportWelcomeTemplate(data.userName, data.expirationDate),
    'support-ticket-assigned': (data) => getSupportTicketAssignedTemplate(data.supportName, data.ticketId, data.ticketTitle, data.priority),
    'user-welcome': (data) => getUserWelcomeTemplate(data.userName),
    'user-password-reset': (data) => getUserPasswordResetTemplate(data.resetLink, data.expirationTime),
    'user-lifetime-access-activated': (data) => getLifetimeAccessActivatedTemplate(data.userName),
  };

  getTemplate(templateName: string, data: any): string | null {
    const templateFn = this.templates[templateName];
    
    if (!templateFn) {
      return null;
    }

    try {
      return templateFn(data);
    } catch (error) {
      console.error(`Error rendering template ${templateName}:`, error);
      return null;
    }
  }

  getAvailableTemplates(): string[] {
    return Object.keys(this.templates);
  }
}
