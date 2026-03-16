import { getBaseEmailTemplate } from '../components/base.template';

export function getBusinessWelcomeTemplate(firstName: string): string {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <img src="https://somaaiuploads.s3.us-east-1.amazonaws.com/logomarca/logobusiness.png" alt="SomaAI Business" style="max-width: 200px; height: auto; margin-bottom: 20px;">
      <h2 style="color: #2c3e50; margin: 0; font-size: 24px; font-weight: 600;">
        Bem-vindo ao SomaAI Business!
      </h2>
      <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 16px;">
        Sua plataforma de gestão empresarial inteligente
      </p>
    </div>

    <div class="alert alert-success">
      <h3 style="margin: 0 0 10px 0; font-size: 16px;">🎉 Conta Criada com Sucesso</h3>
      <p style="margin: 0; font-size: 14px;">
        Olá <strong>${firstName}</strong>, sua conta foi criada com sucesso! Você agora tem acesso completo à plataforma SomaAI Business.
      </p>
    </div>

    <div style="background-color: #f8fafc; padding: 25px; border-radius: 8px; margin: 25px 0;">
      <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 18px;">🚀 Próximos Passos</h3>
      
      <div style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
          <span style="background: #3498db; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; margin-right: 15px;">1</span>
          <span style="color: #2c3e50; font-weight: 500;">Configure seu estabelecimento</span>
        </div>
        <p style="margin: 0 0 0 39px; color: #7f8c8d; font-size: 14px;">
          Adicione informações do seu negócio, endereço e dados de contato
        </p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
          <span style="background: #3498db; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; margin-right: 15px;">2</span>
          <span style="color: #2c3e50; font-weight: 500;">Cadastre seus produtos/serviços</span>
        </div>
        <p style="margin: 0 0 0 39px; color: #7f8c8d; font-size: 14px;">
          Adicione seus produtos ou serviços com preços e descrições
        </p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
          <span style="background: #3498db; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; margin-right: 15px;">3</span>
          <span style="color: #2c3e50; font-weight: 500;">Convide sua equipe</span>
        </div>
        <p style="margin: 0 0 0 39px; color: #7f8c8d; font-size: 14px;">
          Adicione membros da equipe com diferentes níveis de acesso
        </p>
      </div>

      <div>
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
          <span style="background: #3498db; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; margin-right: 15px;">4</span>
          <span style="color: #2c3e50; font-weight: 500;">Comece a gerenciar seu negócio</span>
        </div>
        <p style="margin: 0 0 0 39px; color: #7f8c8d; font-size: 14px;">
          Gerencie clientes, pedidos, estoque e vendas em um único lugar
        </p>
      </div>
    </div>

    <div class="alert alert-info">
      <h3 style="margin: 0 0 10px 0; font-size: 16px;">💼 Recursos Disponíveis</h3>
      <ul style="margin: 10px 0; padding-left: 20px; color: #1565c0;">
        <li>Gestão de clientes e contatos</li>
        <li>Controle de inventário e estoque</li>
        <li>Processamento de pedidos e vendas</li>
        <li>Relatórios e análises de negócio</li>
        <li>Gestão de estabelecimentos</li>
        <li>Controle de ofertas e promoções</li>
        <li>Suporte a múltiplos usuários</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://somaaiapp.com.br/business/dashboard" class="button" style="color: white; text-decoration: none;">
        📊 Acessar Dashboard
      </a>
    </div>

    <div class="alert alert-warning">
      <h3 style="margin: 0 0 10px 0; font-size: 16px;">🔒 Segurança</h3>
      <p style="margin: 0; font-size: 14px;">
        Seus dados empresariais estão protegidos com criptografia de ponta. Nunca compartilhe suas credenciais 
        e sempre acesse a plataforma através do site oficial.
      </p>
    </div>

    <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
      <p style="margin: 0; color: #7f8c8d; font-size: 14px;">
        Precisa de ajuda? Entre em contato com nosso suporte em <strong>suporte@somaai.com.br</strong>
      </p>
    </div>
  `;

  return getBaseEmailTemplate(content, {
    title: 'Bem-vindo ao SomaAI Business',
    headerTitle: 'Conta Criada com Sucesso'
  });
}
