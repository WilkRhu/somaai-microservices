import * as Handlebars from 'handlebars';

export class TemplateLoader {
  private templates: Map<string, string> = new Map();

  constructor() {
    this.loadBuiltInTemplates();
  }

  private loadBuiltInTemplates() {
    this.templates.set('user-welcome', this.getUserWelcomeTemplate());
    this.templates.set('order-confirmation', this.getOrderConfirmationTemplate());
    this.templates.set('password-reset', this.getPasswordResetTemplate());
    this.templates.set('email-verification', this.getEmailVerificationTemplate());
  }

  getTemplate(templateName: string | undefined, data: Record<string, any> = {}): string | null {
    if (!templateName) return null;

    const template = this.templates.get(templateName);
    if (!template) return null;

    const compiled = Handlebars.compile(template);
    return compiled(data);
  }

  private getUserWelcomeTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bem-vindo ao SomaAI!</h1>
            </div>
            <div class="content">
              <p>Olá {{userName}},</p>
              <p>Sua conta foi criada com sucesso. Estamos felizes em tê-lo conosco!</p>
              <p>Você pode começar a usar a plataforma agora mesmo.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 SomaAI. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getOrderConfirmationTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .order-details { background-color: #f8f9fa; padding: 15px; margin: 15px 0; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Pedido Confirmado!</h1>
            </div>
            <div class="content">
              <p>Olá {{customerName}},</p>
              <p>Seu pedido foi confirmado com sucesso!</p>
              <div class="order-details">
                <p><strong>Número do Pedido:</strong> {{orderId}}</p>
                <p><strong>Data:</strong> {{orderDate}}</p>
                <p><strong>Total:</strong> R$ {{total}}</p>
              </div>
              <p>Você receberá atualizações sobre o status do seu pedido em breve.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 SomaAI. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getPasswordResetTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #ffc107; color: black; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .button { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Redefinir Senha</h1>
            </div>
            <div class="content">
              <p>Olá {{userName}},</p>
              <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para continuar:</p>
              <p><a href="{{resetLink}}" class="button">Redefinir Senha</a></p>
              <p>Este link expira em 24 horas.</p>
              <p>Se você não solicitou isso, ignore este email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 SomaAI. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getEmailVerificationTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #17a2b8; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .button { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verificar Email</h1>
            </div>
            <div class="content">
              <p>Olá {{userName}},</p>
              <p>Obrigado por se registrar! Clique no botão abaixo para verificar seu email:</p>
              <p><a href="{{verificationLink}}" class="button">Verificar Email</a></p>
              <p>Este link expira em 24 horas.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 SomaAI. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
