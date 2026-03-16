"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserWelcomeTemplate = getUserWelcomeTemplate;
const base_template_1 = require("../components/base.template");
function getUserWelcomeTemplate(userName) {
    const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="color: white; font-size: 32px;">🎉</span>
      </div>
      <h2 style="color: #2c3e50; margin: 0; font-size: 24px; font-weight: 600;">
        Bem-vindo ao SomaAI!
      </h2>
      <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 16px;">
        Sua jornada financeira inteligente começa agora
      </p>
    </div>

    <div class="alert alert-success">
      <h3 style="margin: 0 0 10px 0; font-size: 16px;">🎉 Conta Criada com Sucesso</h3>
      <p style="margin: 0; font-size: 14px;">
        Olá <strong>${userName}</strong>, seja bem-vindo à plataforma SomaAI!
      </p>
    </div>

    <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; margin: 25px 0;">
      <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 18px;">🚀 Próximos Passos</h3>
      
      <div style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
          <span style="background: #3498db; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; margin-right: 15px;">1</span>
          <span style="color: #2c3e50; font-weight: 500;">Complete seu perfil</span>
        </div>
        <p style="margin: 0 0 0 39px; color: #7f8c8d; font-size: 14px;">
          Adicione suas informações pessoais e preferências
        </p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
          <span style="background: #3498db; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; margin-right: 15px;">2</span>
          <span style="color: #2c3e50; font-weight: 500;">Configure seus cartões</span>
        </div>
        <p style="margin: 0 0 0 39px; color: #7f8c8d; font-size: 14px;">
          Adicione seus cartões para controle automático de gastos
        </p>
      </div>
      
      <div>
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
          <span style="background: #3498db; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; margin-right: 15px;">3</span>
          <span style="color: #2c3e50; font-weight: 500;">Explore os recursos</span>
        </div>
        <p style="margin: 0 0 0 39px; color: #7f8c8d; font-size: 14px;">
          Descubra relatórios, metas e insights personalizados
        </p>
      </div>
    </div>

    <div class="alert alert-info">
      <h3 style="margin: 0 0 10px 0; font-size: 16px;">💡 Recursos Disponíveis</h3>
      <ul style="margin: 10px 0; padding-left: 20px; color: #1565c0;">
        <li>Controle de gastos em tempo real</li>
        <li>Relatórios financeiros detalhados</li>
        <li>Metas e planejamento financeiro</li>
        <li>Análise de padrões de consumo</li>
        <li>Notificações inteligentes</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://somaaiapp.com.br/login" class="button" style="color: white; text-decoration: none;">
        🏠 Acessar Minha Conta
      </a>
    </div>

    <div class="alert alert-warning">
      <h3 style="margin: 0 0 10px 0; font-size: 16px;">🔒 Segurança</h3>
      <p style="margin: 0; font-size: 14px;">
        Suas informações estão protegidas com criptografia de ponta. Nunca compartilhe suas credenciais 
        e sempre acesse a plataforma através do site oficial.
      </p>
    </div>
  `;
    return (0, base_template_1.getBaseEmailTemplate)(content, {
        title: 'Bem-vindo ao SomaAI',
        headerTitle: 'Conta Criada com Sucesso'
    });
}
//# sourceMappingURL=welcome.template.js.map