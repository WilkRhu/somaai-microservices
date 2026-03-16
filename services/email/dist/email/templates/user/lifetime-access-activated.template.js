"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLifetimeAccessActivatedTemplate = getLifetimeAccessActivatedTemplate;
const base_template_1 = require("../components/base.template");
function getLifetimeAccessActivatedTemplate(userName) {
    const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="color: white; font-size: 32px;">👑</span>
      </div>
      <h2 style="color: #2c3e50; margin: 0; font-size: 24px; font-weight: 600;">
        Acesso Vitalício Ativado!
      </h2>
      <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 16px;">
        Bem-vindo ao clube premium do SomaAI
      </p>
    </div>

    <div class="alert alert-success">
      <h3 style="margin: 0 0 10px 0; font-size: 16px;">🎉 Parabéns, ${userName}!</h3>
      <p style="margin: 0; font-size: 14px;">
        Seu <strong>Acesso Vitalício</strong> foi ativado com sucesso! Agora você tem acesso ilimitado a todos os recursos premium da plataforma.
      </p>
    </div>

    <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; margin: 25px 0;">
      <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 18px;">👑 Recursos Premium Desbloqueados</h3>
      
      <div style="margin-bottom: 15px;">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="color: #f39c12; margin-right: 10px; font-size: 16px;">✨</span>
          <span style="color: #2c3e50; font-weight: 500;">Relatórios Avançados Ilimitados</span>
        </div>
        <p style="margin: 0 0 0 26px; color: #7f8c8d; font-size: 14px;">
          Análises detalhadas e insights personalizados sem limites
        </p>
      </div>
      
      <div style="margin-bottom: 15px;">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="color: #f39c12; margin-right: 10px; font-size: 16px;">📊</span>
          <span style="color: #2c3e50; font-weight: 500;">Dashboard Premium</span>
        </div>
        <p style="margin: 0 0 0 26px; color: #7f8c8d; font-size: 14px;">
          Interface exclusiva com widgets avançados e customizações
        </p>
      </div>
      
      <div style="margin-bottom: 15px;">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="color: #f39c12; margin-right: 10px; font-size: 16px;">🔔</span>
          <span style="color: #2c3e50; font-weight: 500;">Notificações Inteligentes</span>
        </div>
        <p style="margin: 0 0 0 26px; color: #7f8c8d; font-size: 14px;">
          Alertas personalizados e lembretes automáticos
        </p>
      </div>
      
      <div style="margin-bottom: 15px;">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="color: #f39c12; margin-right: 10px; font-size: 16px;">🎯</span>
          <span style="color: #2c3e50; font-weight: 500;">Metas Avançadas</span>
        </div>
        <p style="margin: 0 0 0 26px; color: #7f8c8d; font-size: 14px;">
          Planejamento financeiro com IA e projeções inteligentes
        </p>
      </div>
      
      <div>
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="color: #f39c12; margin-right: 10px; font-size: 16px;">🏆</span>
          <span style="color: #2c3e50; font-weight: 500;">Suporte Prioritário</span>
        </div>
        <p style="margin: 0 0 0 26px; color: #7f8c8d; font-size: 14px;">
          Atendimento exclusivo e suporte técnico especializado
        </p>
      </div>
    </div>

    <div class="alert alert-info">
      <h3 style="margin: 0 0 10px 0; font-size: 16px;">💎 Benefícios Exclusivos</h3>
      <ul style="margin: 10px 0; padding-left: 20px; color: #1565c0;">
        <li><strong>Acesso vitalício</strong> - Sem renovações ou taxas adicionais</li>
        <li><strong>Todas as atualizações futuras</strong> incluídas automaticamente</li>
        <li><strong>Recursos beta</strong> - Teste novidades antes de todos</li>
        <li><strong>Comunidade VIP</strong> - Acesso ao grupo exclusivo de usuários premium</li>
        <li><strong>Consultoria personalizada</strong> - Sessões mensais com especialistas</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://somaaiapp.com.br/login" class="button" style="color: white; text-decoration: none; background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);">
        👑 Acessar Minha Conta
      </a>
    </div>

    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
      <h3 style="color: white; margin: 0 0 10px 0; font-size: 18px;">🚀 Próximos Passos</h3>
      <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;">
        Explore sua nova área premium e descubra como maximizar seus resultados financeiros com nossos recursos exclusivos.
      </p>
    </div>

    <div class="alert alert-warning">
      <h3 style="margin: 0 0 10px 0; font-size: 16px;">📞 Precisa de Ajuda?</h3>
      <p style="margin: 0; font-size: 14px;">
        Nossa equipe de suporte premium está disponível 24/7 para ajudar você a aproveitar ao máximo 
        seus novos recursos. Entre em contato através do chat exclusivo na plataforma.
      </p>
    </div>
  `;
    return (0, base_template_1.getBaseEmailTemplate)(content, {
        title: 'Acesso Vitalício Ativado - SomaAI',
        headerTitle: 'Acesso Vitalício Ativado'
    });
}
//# sourceMappingURL=lifetime-access-activated.template.js.map