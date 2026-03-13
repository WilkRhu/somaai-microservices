import { getBaseEmailTemplate } from '../components/base.template';

export function getSupportWelcomeTemplate(userName: string, expirationDate: string): string {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="color: white; font-size: 32px;">🎧</span>
      </div>
      <h2 style="color: #2c3e50; margin: 0; font-size: 24px; font-weight: 600;">
        Bem-vindo à Equipe de Suporte!
      </h2>
      <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 16px;">
        Você agora faz parte do suporte SomaAI
      </p>
    </div>

    <div class="alert alert-success">
      <h3 style="margin: 0 0 10px 0; font-size: 16px;">🎉 Conta de Suporte Criada</h3>
      <p style="margin: 0; font-size: 14px;">
        Olá <strong>${userName}</strong>, sua conta de suporte foi criada com sucesso!
      </p>
    </div>

    <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; margin: 25px 0;">
      <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 18px;">🔑 Detalhes da Conta</h3>
      
      <div style="margin-bottom: 15px;">
        <strong style="color: #34495e;">Tipo de Conta:</strong>
        <span style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-left: 10px;">
          SUPORTE
        </span>
      </div>
      
      <div style="margin-bottom: 15px;">
        <strong style="color: #34495e;">Usuário:</strong>
        <span style="color: #7f8c8d;">${userName}</span>
      </div>
      
      <div style="margin-bottom: 15px;">
        <strong style="color: #34495e;">Plano:</strong>
        <span style="background: #f39c12; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-left: 10px;">
          LIFETIME
        </span>
      </div>
      
      <div>
        <strong style="color: #34495e;">Válido até:</strong>
        <span style="color: #27ae60; font-weight: 500;">${expirationDate}</span>
      </div>
    </div>

    <div class="alert alert-info">
      <h3 style="margin: 0 0 10px 0; font-size: 16px;">🛠️ Privilégios de Suporte</h3>
      <ul style="margin: 10px 0; padding-left: 20px; color: #1565c0;">
        <li>Acesso ao sistema de tickets</li>
        <li>Gerenciamento de solicitações de usuários</li>
        <li>Visualização de logs e relatórios básicos</li>
        <li>Ferramentas de diagnóstico</li>
        <li>Base de conhecimento interna</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://somaaiapp.com.br/login" class="button" style="color: white; text-decoration: none;">
        🎧 Acessar Painel de Suporte
      </a>
    </div>

    <div class="alert alert-warning">
      <h3 style="margin: 0 0 10px 0; font-size: 16px;">📋 Diretrizes de Suporte</h3>
      <p style="margin: 0; font-size: 14px;">
        Lembre-se de seguir os protocolos de atendimento e manter a confidencialidade das informações dos usuários. 
        Para dúvidas sobre procedimentos, consulte o manual interno ou contate a supervisão.
      </p>
    </div>
  `;

  return getBaseEmailTemplate(content, {
    title: 'Bem-vindo à Equipe de Suporte - SomaAI',
    headerTitle: 'Conta de Suporte Criada'
  });
}