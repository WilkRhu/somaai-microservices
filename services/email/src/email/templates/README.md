# Templates de Email - SomaAI

Esta pasta contém todos os templates de email organizados por categoria e com componentes reutilizáveis.

## 📁 Estrutura

```
templates/
├── components/          # Componentes reutilizáveis
│   ├── base.template.ts    # Template base com header/footer
│   ├── header.template.ts  # Header padrão com logo
│   └── footer.template.ts  # Footer com informações da empresa
├── admin/              # Templates para administradores
│   ├── welcome.template.ts      # Boas-vindas admin
│   └── user-created.template.ts # Notificação de usuário criado
├── support/            # Templates para equipe de suporte
│   ├── welcome.template.ts         # Boas-vindas suporte
│   └── ticket-assigned.template.ts # Ticket atribuído
├── user/               # Templates para usuários finais
│   ├── welcome.template.ts        # Boas-vindas usuário
│   └── password-reset.template.ts # Redefinição de senha
└── index.ts            # Exportações centralizadas
```

## 🎨 Design System

### Cores Principais
- **Admin**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Support**: `linear-gradient(135deg, #3498db 0%, #2980b9 100%)`
- **User**: `linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)`
- **Warning**: `#f39c12`
- **Success**: `#27ae60`
- **Info**: `#3498db`

### Componentes de Alerta
- `.alert-info` - Informações gerais
- `.alert-warning` - Avisos importantes
- `.alert-success` - Confirmações e sucessos

### Botões
- Classe `.button` com gradiente padrão
- Hover com `transform: translateY(-1px)`

## 🚀 Como Usar

### Template Base
```typescript
import { getBaseEmailTemplate } from './components/base.template';

const content = `<div>Seu conteúdo aqui</div>`;
const html = getBaseEmailTemplate(content, {
  title: 'Título do Email',
  headerTitle: 'Título do Header'
});
```

### Templates Específicos
```typescript
import { 
  getAdminWelcomeTemplate,
  getSupportWelcomeTemplate,
  getUserWelcomeTemplate 
} from './templates';

// Admin
const adminEmail = getAdminWelcomeTemplate('João Admin', '2025-12-31');

// Support
const supportEmail = getSupportWelcomeTemplate('Maria Support', '2025-12-31');

// User
const userEmail = getUserWelcomeTemplate('Carlos User');
```

## 📱 Responsividade

Todos os templates são responsivos com:
- Breakpoint em 600px
- Padding reduzido em mobile
- Fonte Inter para melhor legibilidade
- Suporte a dark mode (futuro)

## 🔧 Personalização

### Adicionando Novos Templates
1. Crie o arquivo na pasta apropriada (`admin/`, `support/`, `user/`)
2. Use o `getBaseEmailTemplate` como base
3. Adicione a exportação no `index.ts`
4. Documente no README

### Modificando Componentes
- **Header**: Altere logo, cores ou layout em `header.template.ts`
- **Footer**: Modifique informações da empresa em `footer.template.ts`
- **Base**: Ajuste estilos globais em `base.template.ts`

## 🎯 Boas Práticas

1. **Sempre use o template base** para consistência
2. **Mantenha a hierarquia de cores** por tipo de usuário
3. **Use emojis com moderação** para melhor acessibilidade
4. **Teste em diferentes clientes** de email
5. **Mantenha textos concisos** e objetivos

## 🔄 Migração

Templates antigos estão marcados como deprecated:
- `admin-welcome.template.ts` → `admin/welcome.template.ts`

Para migrar, simplesmente atualize as importações:
```typescript
// Antigo
import { getAdminWelcomeTemplate } from './admin-welcome.template';

// Novo
import { getAdminWelcomeTemplate } from './admin/welcome.template';
```