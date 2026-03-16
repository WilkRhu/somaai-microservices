"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupportTicketAssignedTemplate = getSupportTicketAssignedTemplate;
const base_template_1 = require("../components/base.template");
function getSupportTicketAssignedTemplate(supportName, ticketId, ticketTitle, priority) {
    const getPriorityColor = (priority) => {
        switch (priority.toLowerCase()) {
            case 'alta': return '#e74c3c';
            case 'média': return '#f39c12';
            case 'baixa': return '#27ae60';
            default: return '#3498db';
        }
    };
    const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="color: white; font-size: 32px;">🎫</span>
      </div>
      <h2 style="color: #2c3e50; margin: 0; font-size: 24px; font-weight: 600;">
        Ticket Atribuído
      </h2>
      <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 16px;">
        Nova solicitação de suporte
      </p>
    </div>

    <div class="alert alert-info">
      <h3 style="margin: 0 0 10px 0; font-size: 16px;">🎧 Novo Ticket Atribuído</h3>
      <p style="margin: 0; font-size: 14px;">
        Olá <strong>${supportName}</strong>, um novo ticket foi atribuído a você.
      </p>
    </div>

    <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; margin: 25px 0;">
      <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 18px;">🎫 Detalhes do Ticket</h3>
      
      <div style="margin-bottom: 15px;">
        <strong style="color: #34495e;">ID do Ticket:</strong>
        <span style="background: #ecf0f1; color: #2c3e50; padding: 4px 8px; border-radius: 4px; font-family: monospace; margin-left: 10px;">
          #${ticketId}
        </span>
      </div>
      
      <div style="margin-bottom: 15px;">
        <strong style="color: #34495e;">Título:</strong>
        <span style="color: #7f8c8d; margin-left: 10px;">${ticketTitle}</span>
      </div>
      
      <div style="margin-bottom: 15px;">
        <strong style="color: #34495e;">Prioridade:</strong>
        <span style="background: ${getPriorityColor(priority)}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-left: 10px;">
          ${priority.toUpperCase()}
        </span>
      </div>
      
      <div>
        <strong style="color: #34495e;">Atribuído em:</strong>
        <span style="color: #7f8c8d; margin-left: 10px;">${new Date().toLocaleString('pt-BR')}</span>
      </div>
    </div>

    <div class="alert alert-warning">
      <h3 style="margin: 0 0 10px 0; font-size: 16px;">⏰ SLA de Atendimento</h3>
      <p style="margin: 0; font-size: 14px;">
        ${priority.toLowerCase() === 'alta' ? 'Resposta em até 2 horas' :
        priority.toLowerCase() === 'média' ? 'Resposta em até 8 horas' :
            'Resposta em até 24 horas'}
      </p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://somaaiapp.com.br/login" class="button" style="color: white; text-decoration: none;">
        🎫 Ver Ticket
      </a>
    </div>
  `;
    return (0, base_template_1.getBaseEmailTemplate)(content, {
        title: 'Ticket Atribuído - SomaAI Support',
        headerTitle: 'Nova Solicitação de Suporte'
    });
}
//# sourceMappingURL=ticket-assigned.template.js.map