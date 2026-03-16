import { getBaseEmailTemplate } from '../components/base.template';

export function getCustomerWelcomeTemplate(name: string, establishmentName?: string): string {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h2 style="color: #2c3e50; margin: 0; font-size: 24px; font-weight: 600;">
        Bem-vindo, ${name}!
      </h2>
      <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 16px;">
        Você foi cadastrado como cliente${establishmentName ? ` em <strong>${establishmentName}</strong>` : ''}.
      </p>
    </div>

    <div class="alert alert-success">
      <h3 style="margin: 0 0 10px 0; font-size: 16px;">🎉 Cadastro Realizado</h3>
      <p style="margin: 0; font-size: 14px;">
        Seu cadastro foi realizado com sucesso. Agora você pode aproveitar todos os benefícios e promoções exclusivas.
      </p>
    </div>

    <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; margin: 25px 0;">
      <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 18px;">✨ Seus Benefícios</h3>
      <ul style="color: #555; font-size: 14px; line-height: 1.8; padding-left: 20px;">
        <li>Acesso a promoções e ofertas exclusivas</li>
        <li>Programa de fidelidade e pontos</li>
        <li>Histórico de compras e pedidos</li>
      </ul>
    </div>
  `;
  return getBaseEmailTemplate(content, { title: `Bem-vindo, ${name}!` });
}
