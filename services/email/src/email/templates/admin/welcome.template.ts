import { getBaseEmailTemplate } from '../components/base.template';

export function getAdminWelcomeTemplate(userName: string, expirationDate: string): string {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="color: white; font-size: 32px;">👑</span>
      </div>
      <h2 style="color: #2c3e50; margin: 0; font-size: 24px; font-weight: 600;">
        Bem-vindo à Equipe SomaAI!
      </h2>
      <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 16px;">
        Você agora faz parte da administração
      </p>
    </div>

    <div class="alert alert-success">
      <h3 style="margin: 0 0 10px 0; font-size: 16px;">🎉 Conta Administrativa Criada</h3>
      <p style="margin: 0; font-size: 14px;">
        Olá <strong>${userName}</strong>, sua conta de administrador foi criada com sucesso!
      </p>
    </div>

    <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; margin: 25px 0;">
      <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 18px;">🔑 Detalhes da Conta</h3>
      
      <div style="margin-bottom: 15px;">
        <strong style="color: #34495e;">Tipo de Conta:</strong>
        <span style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-left: 10px;">
          ADMINISTRADOR
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
      <h3 style="margin: 0 0 10px 0; font-size: 16px;">🛡️ Privilégios de Administrador</h3>
      <ul style="margin: 10px 0; padding-left: 20px; color: #1565c0;">
        <li>Acesso completo ao painel administrativo</li>
        <li>Gerenciamento de usuários e permissões</li>
        <li>Visualização de relatórios avançados</li>
        <li>Configuração do sistema</li>
        <li>Suporte técnico prioritário</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://somaaiapp.com.br/login" class="button" style="color: white; text-decoration: none;">
        🚀 Acessar Painel Admin
      </a>
    </div>

    <div class="alert alert-warning">
      <h3 style="margin: 0 0 10px 0; font-size: 16px;">⚠️ Importante</h3>
      <p style="margin: 0; font-size: 14px;">
        Mantenha suas credenciais seguras e não compartilhe o acesso administrativo. 
        Em caso de problemas, entre em contato com o suporte técnico.
      </p>
    </div>
  `;

  return getBaseEmailTemplate(content, {
    title: 'Bem-vindo à Equipe SomaAI - Administrador',
    headerTitle: 'Conta Administrativa Criada'
  });
}