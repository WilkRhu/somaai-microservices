import { getBaseEmailTemplate } from '../components/base.template';

export function getEmployeeWelcomeTemplate(name: string, email: string, password: string, establishmentName?: string): string {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h2 style="color: #2c3e50; margin: 0; font-size: 24px; font-weight: 600;">
        Bem-vindo à equipe, ${name}!
      </h2>
      <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 16px;">
        Você foi cadastrado como funcionário${establishmentName ? ` em <strong>${establishmentName}</strong>` : ''}.
      </p>
    </div>

    <div class="alert alert-success">
      <h3 style="margin: 0 0 10px 0; font-size: 16px;">🎉 Conta Criada com Sucesso</h3>
      <p style="margin: 0; font-size: 14px;">
        Sua conta foi criada. Use as credenciais abaixo para acessar o sistema.
      </p>
    </div>

    <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; margin: 25px 0;">
      <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 18px;">🔑 Suas Credenciais de Acesso</h3>
      <table style="width: 100%; font-size: 14px; color: #555;">
        <tr>
          <td style="padding: 8px 0; font-weight: 600; width: 120px;">E-mail:</td>
          <td style="padding: 8px 0;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Senha:</td>
          <td style="padding: 8px 0;">${password}</td>
        </tr>
      </table>
      <p style="color: #e74c3c; font-size: 13px; margin: 15px 0 0 0;">
        ⚠️ Por segurança, altere sua senha no primeiro acesso.
      </p>
    </div>
  `;
  return getBaseEmailTemplate(content, { title: `Bem-vindo à equipe, ${name}!` });
}
