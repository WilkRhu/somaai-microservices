import { getBaseEmailTemplate } from '../components/base.template';

export function getUserPasswordResetTemplate(userName: string, resetCode: string, expirationMinutes: number = 15): string {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="color: white; font-size: 32px;">🔐</span>
      </div>
      <h2 style="color: #2c3e50; margin: 0; font-size: 24px; font-weight: 600;">
        Redefinição de Senha
      </h2>
      <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 16px;">
        Solicitação de nova senha
      </p>
    </div>

    <div class="alert alert-info">
      <h3 style="margin: 0 0 10px 0; font-size: 16px;">🔑 Código de Redefinição</h3>
      <p style="margin: 0; font-size: 14px;">
        Olá <strong>${userName}</strong>, recebemos uma solicitação para redefinir sua senha.
      </p>
    </div>

    <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center;">
      <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 18px;">🔢 Seu Código de Verificação</h3>
      
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; display: inline-block;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; font-family: monospace;">
          ${resetCode}
        </span>
      </div>
      
      <p style="color: #7f8c8d; margin: 15px 0 0 0; font-size: 14px;">
        Digite este código na tela de redefinição de senha
      </p>
    </div>

    <div class="alert alert-warning">
      <h3 style="margin: 0 0 10px 0; font-size: 16px;">⏰ Importante</h3>
      <ul style="margin: 10px 0; padding-left: 20px; color: #e65100;">
        <li>Este código expira em <strong>${expirationMinutes} minutos</strong></li>
        <li>Use apenas uma vez</li>
        <li>Não compartilhe com ninguém</li>
        <li>Se não solicitou, ignore este email</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://somaaiapp.com.br/login" class="button" style="color: white; text-decoration: none;">
        🔐 Redefinir Senha
      </a>
    </div>

    <div class="alert alert-info">
      <h3 style="margin: 0 0 10px 0; font-size: 16px;">🛡️ Segurança</h3>
      <p style="margin: 0; font-size: 14px;">
        Se você não solicitou esta redefinição, sua conta permanece segura. 
        Você pode ignorar este email com segurança.
      </p>
    </div>
  `;

  return getBaseEmailTemplate(content, {
    title: 'Redefinição de Senha - SomaAI',
    headerTitle: 'Código de Verificação'
  });
}