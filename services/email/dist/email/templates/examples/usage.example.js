"use strict";
/**
 * Exemplos de uso dos templates de email
 * Este arquivo demonstra como usar os diferentes templates disponíveis
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMAIL_CONFIG = exports.EmailTemplateExamples = void 0;
exports.generateWelcomeEmail = generateWelcomeEmail;
exports.generateAdminNotification = generateAdminNotification;
const index_1 = require("../index");
// ===== EXEMPLOS DE USO =====
class EmailTemplateExamples {
    // 👑 ADMIN TEMPLATES
    static getAdminWelcomeExample() {
        return (0, index_1.getAdminWelcomeTemplate)('João Silva', '31/12/2025');
    }
    static getAdminUserCreatedExample() {
        return (0, index_1.getAdminUserCreatedTemplate)('Admin João', 'Maria Santos', 'support');
    }
    // 🎧 SUPPORT TEMPLATES
    static getSupportWelcomeExample() {
        return (0, index_1.getSupportWelcomeTemplate)('Maria Santos', '31/12/2025');
    }
    static getSupportTicketAssignedExample() {
        return (0, index_1.getSupportTicketAssignedTemplate)('Carlos Support', 'TK-2025-001', 'Problema com login na plataforma', 'alta');
    }
    // 👤 USER TEMPLATES
    static getUserWelcomeExample() {
        return (0, index_1.getUserWelcomeTemplate)('Ana Costa');
    }
    static getUserPasswordResetExample() {
        return (0, index_1.getUserPasswordResetTemplate)('Pedro Oliveira', '123456', 15);
    }
    static getLifetimeAccessActivatedExample() {
        return (0, index_1.getLifetimeAccessActivatedTemplate)('Carlos Premium');
    }
    // 🎨 TEMPLATE CUSTOMIZADO
    static getCustomTemplateExample() {
        const customContent = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #2c3e50;">Template Personalizado</h2>
        <p style="color: #7f8c8d;">Este é um exemplo de template customizado</p>
      </div>

      <div class="alert alert-info">
        <h3 style="margin: 0 0 10px 0;">📋 Informação</h3>
        <p style="margin: 0;">Você pode criar templates personalizados usando o template base.</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="#" class="button" style="color: white; text-decoration: none;">
          🚀 Botão de Ação
        </a>
      </div>
    `;
        return (0, index_1.getBaseEmailTemplate)(customContent, {
            title: 'Template Personalizado - SomaAI',
            headerTitle: 'Exemplo Customizado'
        });
    }
}
exports.EmailTemplateExamples = EmailTemplateExamples;
// ===== HELPER FUNCTIONS =====
/**
 * Gera email baseado no tipo de usuário e evento
 */
function generateWelcomeEmail(userName, userRole, expirationDate) {
    switch (userRole) {
        case 'admin':
            return (0, index_1.getAdminWelcomeTemplate)(userName, expirationDate || '31/12/2025');
        case 'support':
            return (0, index_1.getSupportWelcomeTemplate)(userName, expirationDate || '31/12/2025');
        case 'user':
        default:
            return (0, index_1.getUserWelcomeTemplate)(userName);
    }
}
/**
 * Gera email de notificação para admins
 */
function generateAdminNotification(adminName, eventType, eventData) {
    switch (eventType) {
        case 'user_created':
            return (0, index_1.getAdminUserCreatedTemplate)(adminName, eventData.newUserName, eventData.userRole);
        case 'ticket_escalated':
            // Implementar quando necessário
            return (0, index_1.getBaseEmailTemplate)(`<p>Ticket ${eventData.ticketId} foi escalado.</p>`, { title: 'Ticket Escalado' });
        default:
            throw new Error(`Tipo de evento não suportado: ${eventType}`);
    }
}
// ===== CONFIGURAÇÕES =====
exports.EMAIL_CONFIG = {
    // URLs base para diferentes ambientes
    URLS: {
        production: 'https://somaaiapp.com.br',
        staging: 'https://staging.somaaiapp.com.br',
        development: 'http://localhost:3000'
    },
    // Configurações de logo
    LOGO: {
        url: 'https://somaaiapp.com.br/logo.png',
        alt: 'SomaAI Logo',
        height: '50px'
    },
    // Informações de contato
    CONTACT: {
        email: 'suporte@somaaiapp.com.br',
        phone: '(11) 9999-9999',
        website: 'www.somaaiapp.com.br'
    }
};
//# sourceMappingURL=usage.example.js.map