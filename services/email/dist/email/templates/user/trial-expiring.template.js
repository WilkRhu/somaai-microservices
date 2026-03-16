"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrialExpiringTemplate = getTrialExpiringTemplate;
const base_template_1 = require("../components/base.template");
function getTrialExpiringTemplate(userName, daysRemaining, expiresAt) {
    const expirationDate = expiresAt.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    const isUrgent = daysRemaining <= 1;
    const subject = isUrgent
        ? '⚠️ Seu Trial Premium expira hoje!'
        : `⏰ Seu Trial Premium expira em ${daysRemaining} dias`;
    const urgencyColor = isUrgent ? '#ef4444' : '#f59e0b';
    const urgencyBg = isUrgent ? '#fef2f2' : '#fef3c7';
    const urgencyIcon = isUrgent ? '🚨' : '⏰';
    const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="font-size: 64px; margin-bottom: 20px;">${urgencyIcon}</div>
      <h1 style="color: ${urgencyColor}; margin: 0; font-size: 28px; font-weight: bold;">
        ${isUrgent ? 'Trial Expira Hoje!' : `${daysRemaining} Dias Restantes`}
      </h1>
      <p style="color: #64748b; font-size: 16px; margin: 10px 0 0 0;">
        Não perca o acesso às funcionalidades premium
      </p>
    </div>

    <div style="background: ${urgencyBg}; border: 2px solid ${urgencyColor}; 
                border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
      <h2 style="color: ${urgencyColor}; margin: 0 0 15px 0; font-size: 20px;">
        Olá, ${userName}! 👋
      </h2>
      <p style="color: ${urgencyColor}; margin: 0; font-size: 16px; line-height: 1.5;">
        ${isUrgent
        ? `Seu trial premium <strong>expira hoje</strong> às ${expirationDate.split(' ')[1]}!`
        : `Seu trial premium expira em <strong>${daysRemaining} dias</strong> (${expirationDate})`}
        <br><br>
        Continue aproveitando todas as funcionalidades premium assinando agora!
      </p>
    </div>

    <div style="margin: 30px 0;">
      <h3 style="color: #1f2937; margin-bottom: 20px; font-size: 18px; text-align: center;">
        💎 O que você vai perder se não assinar:
      </h3>
      
      <div style="display: grid; gap: 12px;">
        <div style="display: flex; align-items: center; padding: 12px; 
                    background: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
          <span style="font-size: 20px; margin-right: 12px;">📱</span>
          <span style="color: #1f2937; font-size: 14px;">Scanner OCR Ilimitado</span>
        </div>

        <div style="display: flex; align-items: center; padding: 12px; 
                    background: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
          <span style="font-size: 20px; margin-right: 12px;">🤖</span>
          <span style="color: #1f2937; font-size: 14px;">Previsões inteligentes com IA</span>
        </div>

        <div style="display: flex; align-items: center; padding: 12px; 
                    background: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
          <span style="font-size: 20px; margin-right: 12px;">📊</span>
          <span style="color: #1f2937; font-size: 14px;">Relatórios avançados (PDF/Excel)</span>
        </div>

        <div style="display: flex; align-items: center; padding: 12px; 
                    background: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
          <span style="font-size: 20px; margin-right: 12px;">💰</span>
          <span style="color: #1f2937; font-size: 14px;">Comparativo automático de preços</span>
        </div>

        <div style="display: flex; align-items: center; padding: 12px; 
                    background: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
          <span style="font-size: 20px; margin-right: 12px;">💬</span>
          <span style="color: #1f2937; font-size: 14px;">Suporte prioritário via WhatsApp</span>
        </div>
      </div>
    </div>

    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                border-radius: 12px; padding: 25px; margin: 30px 0; color: white; text-align: center;">
      <h3 style="margin: 0 0 15px 0; font-size: 20px;">
        🎯 Oferta Especial para Você!
      </h3>
      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">
        <strong>Premium Mensal:</strong> R$ 19,90/mês<br>
        <strong>Premium Anual:</strong> R$ 169,90/ano <span style="background: rgba(255,255,255,0.2); 
        padding: 2px 8px; border-radius: 4px; font-size: 12px;">ECONOMIZE 29%</span>
      </p>
      
      <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
        <a href="${process.env.FRONTEND_URL}/subscription/premium" 
           style="display: inline-block; background: white; color: #059669; 
                  text-decoration: none; padding: 12px 24px; border-radius: 8px; 
                  font-weight: bold; font-size: 14px;">
          💳 Assinar Mensal
        </a>
        
        <a href="${process.env.FRONTEND_URL}/subscription/premium-annual" 
           style="display: inline-block; background: rgba(255,255,255,0.2); color: white; 
                  text-decoration: none; padding: 12px 24px; border-radius: 8px; 
                  font-weight: bold; font-size: 14px; border: 2px solid white;">
          🏆 Assinar Anual (Melhor Oferta)
        </a>
      </div>
    </div>

    ${isUrgent ? `
    <div style="background: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; 
                padding: 20px; margin: 25px 0; text-align: center;">
      <div style="font-size: 32px; margin-bottom: 10px;">🚨</div>
      <h3 style="color: #dc2626; margin: 0 0 10px 0; font-size: 16px;">
        Ação Necessária Hoje!
      </h3>
      <p style="color: #dc2626; margin: 0; font-size: 14px; line-height: 1.5;">
        Após a expiração, você voltará ao plano gratuito com funcionalidades limitadas.<br>
        <strong>Assine agora para manter o acesso completo!</strong>
      </p>
    </div>
    ` : ''}

    <div style="text-align: center; margin: 30px 0; padding: 20px; 
                background: #f1f5f9; border-radius: 8px;">
      <p style="color: #64748b; margin: 0; font-size: 14px;">
        Dúvidas sobre os planos? Responda este email ou entre em contato conosco.<br>
        Estamos aqui para ajudar você a escolher o melhor plano! 💙
      </p>
    </div>
  `;
    return {
        subject,
        html: (0, base_template_1.getBaseEmailTemplate)(content, {
            title: subject,
            headerTitle: daysRemaining === 0 ? 'Trial Expira Hoje' : `Trial Expira em ${daysRemaining} Dias`
        })
    };
}
//# sourceMappingURL=trial-expiring.template.js.map