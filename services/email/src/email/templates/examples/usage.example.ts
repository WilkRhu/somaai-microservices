/**
 * Exemplos de uso dos templates de email
 * Este arquivo demonstra como usar os diferentes templates disponíveis
 */

import {
  // Admin templates
  getAdminWelcomeTemplate,
  getAdminUserCreatedTemplate,
  
  // Support templates
  getSupportWelcomeTemplate,
  getSupportTicketAssignedTemplate,
  
  // User templates
  getUserWelcomeTemplate,
  getUserPasswordResetTemplate,
  getLifetimeAccessActivatedTemplate,
  
  // Components
  getBaseEmailTemplate
} from '../index';

// ===== EXEMPLOS DE USO =====

export class EmailTemplateExamples {
  
  // 👑 ADMIN TEMPLATES
  static getAdminWelcomeExample(): string {
    return getAdminWelcomeTemplate(
      'João Silva',
      '31/12/2025'
    );
  }

  static getAdminUserCreatedExample(): string {
    return getAdminUserCreatedTemplate(
      'Admin João',
      'Maria Santos',
      'support'
    );
  }

  // 🎧 SUPPORT TEMPLATES
  static getSupportWelcomeExample(): string {
    return getSupportWelcomeTemplate(
      'Maria Santos',
      '31/12/2025'
    );
  }

  static getSupportTicketAssignedExample(): string {
    return getSupportTicketAssignedTemplate(
      'Carlos Support',
      'TK-2025-001',
      'Problema com login na plataforma',
      'alta'
    );
  }

  // 👤 USER TEMPLATES
  static getUserWelcomeExample(): string {
    return getUserWelcomeTemplate('Ana Costa');
  }

  static getUserPasswordResetExample(): string {
    return getUserPasswordResetTemplate(
      'Pedro Oliveira',
      '123456',
      15
    );
  }

  static getLifetimeAccessActivatedExample(): string {
    return getLifetimeAccessActivatedTemplate('Carlos Premium');
  }

  // 🎨 TEMPLATE CUSTOMIZADO
  static getCustomTemplateExample(): string {
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

    return getBaseEmailTemplate(customContent, {
      title: 'Template Personalizado - SomaAI',
      headerTitle: 'Exemplo Customizado'
    });
  }
}

// ===== HELPER FUNCTIONS =====

/**
 * Gera email baseado no tipo de usuário e evento
 */
export function generateWelcomeEmail(
  userName: string, 
  userRole: 'admin' | 'support' | 'user',
  expirationDate?: string
): string {
  switch (userRole) {
    case 'admin':
      return getAdminWelcomeTemplate(userName, expirationDate || '31/12/2025');
    
    case 'support':
      return getSupportWelcomeTemplate(userName, expirationDate || '31/12/2025');
    
    case 'user':
    default:
      return getUserWelcomeTemplate(userName);
  }
}

/**
 * Gera email de notificação para admins
 */
export function generateAdminNotification(
  adminName: string,
  eventType: 'user_created' | 'ticket_escalated',
  eventData: any
): string {
  switch (eventType) {
    case 'user_created':
      return getAdminUserCreatedTemplate(
        adminName,
        eventData.newUserName,
        eventData.userRole
      );
    
    case 'ticket_escalated':
      // Implementar quando necessário
      return getBaseEmailTemplate(
        `<p>Ticket ${eventData.ticketId} foi escalado.</p>`,
        { title: 'Ticket Escalado' }
      );
    
    default:
      throw new Error(`Tipo de evento não suportado: ${eventType}`);
  }
}

// ===== CONFIGURAÇÕES =====

export const EMAIL_CONFIG = {
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