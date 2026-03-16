"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminUserCreatedTemplate = getAdminUserCreatedTemplate;
const base_template_1 = require("../components/base.template");
function getAdminUserCreatedTemplate(adminName, newUserName, userRole) {
    const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="color: white; font-size: 32px;">👤</span>
      </div>
      <h2 style="color: #2c3e50; margin: 0; font-size: 24px; font-weight: 600;">
        Novo Usuário Criado
      </h2>
      <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 16px;">
        Notificação administrativa
      </p>
    </div>

    <div class="alert alert-info">
      <h3 style="margin: 0 0 10px 0; font-size: 16px;">📋 Detalhes da Criação</h3>
      <p style="margin: 0; font-size: 14px;">
        Olá <strong>${adminName}</strong>, um novo usuário foi criado no sistema.
      </p>
    </div>

    <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; margin: 25px 0;">
      <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 18px;">👤 Informações do Usuário</h3>
      
      <div style="margin-bottom: 15px;">
        <strong style="color: #34495e;">Nome:</strong>
        <span style="color: #7f8c8d; margin-left: 10px;">${newUserName}</span>
      </div>
      
      <div style="margin-bottom: 15px;">
        <strong style="color: #34495e;">Tipo de Conta:</strong>
        <span style="background: ${userRole === 'admin' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : userRole === 'support' ? 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)' : '#27ae60'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-left: 10px;">
          ${userRole.toUpperCase()}
        </span>
      </div>
      
      <div>
        <strong style="color: #34495e;">Data de Criação:</strong>
        <span style="color: #7f8c8d; margin-left: 10px;">${new Date().toLocaleDateString('pt-BR')}</span>
      </div>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://somaaiapp.com.br/login" class="button" style="color: white; text-decoration: none;">
        👥 Gerenciar Usuários
      </a>
    </div>
  `;
    return (0, base_template_1.getBaseEmailTemplate)(content, {
        title: 'Novo Usuário Criado - SomaAI Admin',
        headerTitle: 'Notificação Administrativa'
    });
}
//# sourceMappingURL=user-created.template.js.map