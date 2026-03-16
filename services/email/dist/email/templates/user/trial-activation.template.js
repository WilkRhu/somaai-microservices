"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrialActivationTemplate = getTrialActivationTemplate;
const base_template_1 = require("../components/base.template");
function getTrialActivationTemplate(userName, expiresAt) {
    const expirationDate = expiresAt.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    const subject = '🎉 Seu Trial Premium foi Ativado!';
    const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="font-size: 64px; margin-bottom: 20px;">🚀</div>
      <h1 style="color: #2563eb; margin: 0; font-size: 28px; font-weight: bold;">
        Trial Premium Ativado!
      </h1>
      <p style="color: #64748b; font-size: 16px; margin: 10px 0 0 0;">
        Explore todas as funcionalidades premium por 10 dias
      </p>
    </div>

    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                border-radius: 12px; padding: 25px; margin: 25px 0; color: white; text-align: center;">
      <h2 style="margin: 0 0 15px 0; font-size: 20px;">
        Olá, ${userName}! 👋
      </h2>
      <p style="margin: 0; font-size: 16px; line-height: 1.5;">
        Seu trial premium de <strong>10 dias</strong> foi ativado com sucesso!<br>
        Aproveite todas as funcionalidades premium até <strong>${expirationDate}</strong>
      </p>
    </div>

    <div style="margin: 30px 0;">
      <h3 style="color: #1f2937; margin-bottom: 20px; font-size: 18px;">
        🎯 O que você pode fazer agora:
      </h3>
      
      <div style="display: grid; gap: 15px;">
        <div style="display: flex; align-items: center; padding: 15px; 
                    background: #f8fafc; border-radius: 8px; border-left: 4px solid #10b981;">
          <span style="font-size: 24px; margin-right: 15px;">📱</span>
          <div>
            <strong style="color: #1f2937;">Scanner OCR Ilimitado</strong>
            <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">
              Escaneie quantas notas fiscais quiser sem limites
            </p>
          </div>
        </div>

        <div style="display: flex; align-items: center; padding: 15px; 
                    background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <span style="font-size: 24px; margin-right: 15px;">🤖</span>
          <div>
            <strong style="color: #1f2937;">Previsões com IA</strong>
            <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">
              Receba insights inteligentes sobre seus gastos futuros
            </p>
          </div>
        </div>

        <div style="display: flex; align-items: center; padding: 15px; 
                    background: #f8fafc; border-radius: 8px; border-left: 4px solid #8b5cf6;">
          <span style="font-size: 24px; margin-right: 15px;">📊</span>
          <div>
            <strong style="color: #1f2937;">Relatórios Avançados</strong>
            <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">
              Exporte relatórios em PDF e Excel com análises detalhadas
            </p>
          </div>
        </div>

        <div style="display: flex; align-items: center; padding: 15px; 
                    background: #f8fafc; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <span style="font-size: 24px; margin-right: 15px;">💰</span>
          <div>
            <strong style="color: #1f2937;">Comparativo de Preços</strong>
            <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">
              Compare preços automaticamente e economize mais
            </p>
          </div>
        </div>

        <div style="display: flex; align-items: center; padding: 15px; 
                    background: #f8fafc; border-radius: 8px; border-left: 4px solid #ef4444;">
          <span style="font-size: 24px; margin-right: 15px;">💬</span>
          <div>
            <strong style="color: #1f2937;">Suporte via WhatsApp</strong>
            <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">
              Atendimento prioritário direto no WhatsApp
            </p>
          </div>
        </div>
      </div>
    </div>

    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; 
                padding: 20px; margin: 25px 0; text-align: center;">
      <div style="font-size: 32px; margin-bottom: 10px;">⏰</div>
      <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">
        Lembrete Importante
      </h3>
      <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
        Seu trial expira em <strong>${expirationDate}</strong><br>
        Você receberá lembretes 2 dias antes do vencimento
      </p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}/dashboard" 
         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; text-decoration: none; padding: 15px 30px; 
                border-radius: 8px; font-weight: bold; font-size: 16px;">
        🚀 Começar a Explorar
      </a>
    </div>

    <div style="text-align: center; margin: 30px 0; padding: 20px; 
                background: #f1f5f9; border-radius: 8px;">
      <p style="color: #64748b; margin: 0; font-size: 14px;">
        Dúvidas? Responda este email ou entre em contato conosco.<br>
        Estamos aqui para ajudar você a aproveitar ao máximo sua experiência premium! 💙
      </p>
    </div>
  `;
    return {
        subject,
        html: (0, base_template_1.getBaseEmailTemplate)(content, {
            title: subject,
            headerTitle: 'Trial Premium Ativado'
        })
    };
}
//# sourceMappingURL=trial-activation.template.js.map