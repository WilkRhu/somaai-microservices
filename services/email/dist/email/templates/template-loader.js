"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateLoader = void 0;
const welcome_template_1 = require("./admin/welcome.template");
const user_created_template_1 = require("./admin/user-created.template");
const welcome_template_2 = require("./support/welcome.template");
const ticket_assigned_template_1 = require("./support/ticket-assigned.template");
const welcome_template_3 = require("./user/welcome.template");
const password_reset_template_1 = require("./user/password-reset.template");
const lifetime_access_activated_template_1 = require("./user/lifetime-access-activated.template");
class TemplateLoader {
    constructor() {
        this.templates = {
            'admin-welcome': (data) => (0, welcome_template_1.getAdminWelcomeTemplate)(data.userName, data.expirationDate),
            'admin-user-created': (data) => (0, user_created_template_1.getAdminUserCreatedTemplate)(data.adminName, data.newUserName, data.userRole),
            'support-welcome': (data) => (0, welcome_template_2.getSupportWelcomeTemplate)(data.userName, data.expirationDate),
            'support-ticket-assigned': (data) => (0, ticket_assigned_template_1.getSupportTicketAssignedTemplate)(data.supportName, data.ticketId, data.ticketTitle, data.priority),
            'user-welcome': (data) => (0, welcome_template_3.getUserWelcomeTemplate)(data.userName),
            'user-password-reset': (data) => (0, password_reset_template_1.getUserPasswordResetTemplate)(data.resetLink, data.expirationTime),
            'user-lifetime-access-activated': (data) => (0, lifetime_access_activated_template_1.getLifetimeAccessActivatedTemplate)(data.userName),
        };
    }
    getTemplate(templateName, data) {
        const templateFn = this.templates[templateName];
        if (!templateFn) {
            return null;
        }
        try {
            return templateFn(data);
        }
        catch (error) {
            console.error(`Error rendering template ${templateName}:`, error);
            return null;
        }
    }
    getAvailableTemplates() {
        return Object.keys(this.templates);
    }
}
exports.TemplateLoader = TemplateLoader;
//# sourceMappingURL=template-loader.js.map