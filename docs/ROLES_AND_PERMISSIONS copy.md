# Tipos de Roles - SomaAI

## 📋 Visão Geral

O sistema SomaAI possui dois contextos de roles:
1. **User Roles** - Para usuários da plataforma geral
2. **Business Roles** - Para usuários dentro de um estabelecimento

---

## 1. User Roles (Módulo de Usuários)

Roles globais da plataforma SomaAI.

### Enum: `UserRole`
**Arquivo**: `src/shared/enums/user-role.enum.ts`

```typescript
export enum UserRole {
  USER = 'user',
  SUPPORT = 'support',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}
```

### Descrição dos Roles

| Role | Valor | Descrição | Permissões |
|------|-------|-----------|-----------|
| **USER** | `user` | Usuário comum | Acesso básico à plataforma, criar estabelecimentos, gerenciar próprios dados |
| **SUPPORT** | `support` | Suporte técnico | Acesso a ferramentas de suporte, visualizar usuários, responder tickets |
| **ADMIN** | `admin` | Administrador | Gerenciar usuários, planos, configurações globais, acesso vitalício |
| **SUPER_ADMIN** | `super_admin` | Super Administrador | Acesso total ao sistema, gerenciar admins, configurações críticas |

### Benefícios por Role

#### USER
- ✅ Criar conta gratuita (15 dias de trial)
- ✅ Criar até 3 estabelecimentos (conforme plano)
- ✅ Acessar módulos: Vendas, Estoque, Clientes, Relatórios
- ✅ Gerenciar próprio perfil
- ❌ Não pode gerenciar outros usuários
- ❌ Não pode acessar painel administrativo

#### SUPPORT
- ✅ Acesso vitalício
- ✅ Visualizar todos os usuários
- ✅ Responder tickets de suporte
- ✅ Acessar logs de sistema
- ✅ Gerenciar campanhas de notificação
- ❌ Não pode deletar usuários
- ❌ Não pode alterar planos

#### ADMIN
- ✅ Acesso vitalício
- ✅ Gerenciar todos os usuários
- ✅ Deletar usuários (exceto outros admins)
- ✅ Alterar planos de usuários
- ✅ Acessar painel administrativo completo
- ✅ Visualizar estatísticas globais
- ❌ Não pode deletar outros admins
- ❌ Não pode acessar configurações críticas (SUPER_ADMIN only)

#### SUPER_ADMIN
- ✅ Acesso total ao sistema
- ✅ Gerenciar admins
- ✅ Acessar configurações críticas
- ✅ Gerenciar integrações
- ✅ Acessar logs de auditoria
- ✅ Configurar variáveis de ambiente

### Atribuição de Roles

#### Criação de Usuário
```typescript
// Registro público - sempre USER
POST /api/users
{
  "email": "usuario@email.com",
  "password": "senha"
}
// Role atribuído: USER

// Criação por admin - pode especificar role
POST /api/users (admin only)
{
  "email": "admin@email.com",
  "password": "senha",
  "role": "admin"
}
// Role atribuído: ADMIN
```

#### Alteração de Role
```typescript
// Apenas ADMIN ou SUPER_ADMIN podem alterar
PATCH /api/users/:id
{
  "role": "support"
}
```

---

## 2. Business Roles (Módulo Business)

Roles específicos dentro de um estabelecimento.

### Enum: `BusinessRole`
**Arquivo**: `src/modules/business/shared/enums/business-role.enum.ts`

```typescript
export enum BusinessRole {
  OWNER = 'business_owner',
  ADMIN = 'business_admin',
  SALES = 'business_sales',
  STOCK = 'business_stock',
  MARKETING = 'business_marketing',
}
```

### Descrição dos Roles

| Role | Valor | Descrição | Permissões |
|------|-------|-----------|-----------|
| **OWNER** | `business_owner` | Proprietário do estabelecimento | Acesso total, gerenciar usuários, configurações, faturamento |
| **ADMIN** | `business_admin` | Administrador do estabelecimento | Gerenciar usuários, configurações, relatórios |
| **SALES** | `business_sales` | Vendedor | Criar vendas, gerenciar clientes, emitir notas fiscais |
| **STOCK** | `business_stock` | Gerenciador de estoque | Gerenciar inventário, fornecedores, compras |
| **MARKETING** | `business_marketing` | Marketing | Gerenciar campanhas, promoções, relatórios de marketing |

### Permissões por Role

#### OWNER (Proprietário)
- ✅ Acesso total ao estabelecimento
- ✅ Gerenciar todos os usuários
- ✅ Alterar configurações do estabelecimento
- ✅ Gerenciar faturamento e planos
- ✅ Acessar todos os módulos
- ✅ Deletar estabelecimento
- ✅ Configurar integrações
- ✅ Acessar relatórios financeiros

#### ADMIN (Administrador)
- ✅ Gerenciar usuários (exceto OWNER)
- ✅ Alterar configurações gerais
- ✅ Acessar todos os módulos
- ✅ Visualizar relatórios
- ✅ Gerenciar campanhas
- ❌ Não pode alterar faturamento
- ❌ Não pode deletar estabelecimento
- ❌ Não pode gerenciar OWNER

#### SALES (Vendedor)
- ✅ Criar vendas
- ✅ Gerenciar clientes
- ✅ Emitir notas fiscais
- ✅ Visualizar estoque
- ✅ Acessar relatórios de vendas
- ❌ Não pode alterar estoque
- ❌ Não pode gerenciar usuários
- ❌ Não pode acessar faturamento

#### STOCK (Gerenciador de Estoque)
- ✅ Gerenciar inventário
- ✅ Gerenciar fornecedores
- ✅ Criar pedidos de compra
- ✅ Receber mercadorias
- ✅ Visualizar relatórios de estoque
- ❌ Não pode criar vendas
- ❌ Não pode gerenciar usuários
- ❌ Não pode acessar faturamento

#### MARKETING (Marketing)
- ✅ Gerenciar campanhas
- ✅ Criar promoções
- ✅ Visualizar relatórios de marketing
- ✅ Gerenciar clientes (visualização)
- ✅ Acessar analytics
- ❌ Não pode criar vendas
- ❌ Não pode alterar estoque
- ❌ Não pode gerenciar usuários

### Atribuição de Business Roles

#### Criação de Usuário no Estabelecimento
```typescript
// Apenas OWNER ou ADMIN podem adicionar usuários
POST /api/business/establishments/:id/users
{
  "email": "vendedor@email.com",
  "role": "business_sales"
}
```

#### Alteração de Role
```typescript
// Apenas OWNER ou ADMIN podem alterar
PATCH /api/business/establishments/:id/users/:userId
{
  "role": "business_stock"
}
```

---

## 3. Matriz de Permissões

### User Roles vs Funcionalidades

| Funcionalidade | USER | SUPPORT | ADMIN | SUPER_ADMIN |
|---|---|---|---|---|
| Criar conta | ✅ | ✅ | ✅ | ✅ |
| Gerenciar próprio perfil | ✅ | ✅ | ✅ | ✅ |
| Criar estabelecimento | ✅ | ❌ | ✅ | ✅ |
| Visualizar usuários | ❌ | ✅ | ✅ | ✅ |
| Gerenciar usuários | ❌ | ❌ | ✅ | ✅ |
| Deletar usuários | ❌ | ❌ | ✅ | ✅ |
| Alterar planos | ❌ | ❌ | ✅ | ✅ |
| Painel administrativo | ❌ | ✅ | ✅ | ✅ |
| Estatísticas globais | ❌ | ✅ | ✅ | ✅ |
| Configurações críticas | ❌ | ❌ | ❌ | ✅ |
| Gerenciar admins | ❌ | ❌ | ❌ | ✅ |
| Logs de auditoria | ❌ | ✅ | ✅ | ✅ |

### Business Roles vs Funcionalidades

| Funcionalidade | OWNER | ADMIN | SALES | STOCK | MARKETING |
|---|---|---|---|---|---|
| Gerenciar usuários | ✅ | ✅ | ❌ | ❌ | ❌ |
| Configurações | ✅ | ✅ | ❌ | ❌ | ❌ |
| Faturamento | ✅ | ❌ | ❌ | ❌ | ❌ |
| Criar vendas | ✅ | ✅ | ✅ | ❌ | ❌ |
| Gerenciar clientes | ✅ | ✅ | ✅ | ❌ | ✅ |
| Emitir notas fiscais | ✅ | ✅ | ✅ | ❌ | ❌ |
| Gerenciar estoque | ✅ | ✅ | ✅ | ✅ | ❌ |
| Gerenciar fornecedores | ✅ | ✅ | ❌ | ✅ | ❌ |
| Criar pedidos de compra | ✅ | ✅ | ❌ | ✅ | ❌ |
| Gerenciar campanhas | ✅ | ✅ | ❌ | ❌ | ✅ |
| Relatórios | ✅ | ✅ | ✅ | ✅ | ✅ |
| Deletar estabelecimento | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 4. Implementação no Código

### Guards de Proteção

#### User Role Guard
```typescript
// src/shared/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

#### Business Role Guard
```typescript
// src/modules/business/establishments/guards/business-role.guard.ts
@Injectable()
export class BusinessRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<BusinessRole[]>(
      'businessRoles',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.businessRole === role);
  }
}
```

### Decoradores

#### User Role Decorator
```typescript
// src/shared/decorators/roles.decorator.ts
export const Roles = (...roles: UserRole[]) =>
  SetMetadata('roles', roles);
```

#### Business Role Decorator
```typescript
// src/modules/business/shared/decorators/business-roles.decorator.ts
export const BusinessRoles = (...roles: BusinessRole[]) =>
  SetMetadata('businessRoles', roles);
```

### Uso em Controllers

#### User Role
```typescript
@Controller('users')
export class UsersController {
  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getAll() {
    // Apenas ADMIN e SUPER_ADMIN podem acessar
  }
}
```

#### Business Role
```typescript
@Controller('business/sales')
export class SalesController {
  @Post()
  @UseGuards(JwtGuard, BusinessRoleGuard)
  @BusinessRoles(BusinessRole.OWNER, BusinessRole.ADMIN, BusinessRole.SALES)
  async create() {
    // Apenas OWNER, ADMIN e SALES podem criar vendas
  }
}
```

---

## 5. Fluxo de Autenticação

### 1. Login
```
1. Usuário faz login
2. Sistema valida credenciais
3. Gera JWT com:
   - userId
   - email
   - role (UserRole)
   - establishmentId (se aplicável)
   - businessRole (se aplicável)
4. Retorna token
```

### 2. Requisição Autenticada
```
1. Frontend envia requisição com token no header
2. JwtGuard valida token
3. Extrai dados do usuário
4. RolesGuard verifica se role está autorizado
5. Se autorizado, executa controller
6. Se não autorizado, retorna 403 Forbidden
```

### 3. Verificação de Permissões
```typescript
// No controller
async create(@Request() req: any) {
  const user = req.user; // { id, email, role, establishmentId, businessRole }
  
  // Verificar role
  if (user.role !== UserRole.ADMIN) {
    throw new ForbiddenException('Acesso negado');
  }
  
  // Verificar business role
  if (user.businessRole !== BusinessRole.OWNER) {
    throw new ForbiddenException('Acesso negado');
  }
}
```

---

## 6. Planos e Roles

### Relação entre Planos e Roles

| Plano | User Role | Benefícios |
|------|-----------|-----------|
| **Free** | USER | 15 dias de trial, 1 estabelecimento |
| **Starter** | USER | 1 mês, 3 estabelecimentos |
| **Professional** | USER | 1 ano, 10 estabelecimentos |
| **Enterprise** | USER | Ilimitado, suporte dedicado |
| **Vitalício** | ADMIN, SUPPORT | Acesso permanente, sem expiração |

### Atribuição Automática
```typescript
// Ao criar usuário
if (role === UserRole.ADMIN || role === UserRole.SUPPORT) {
  planType = 'lifetime';
  planExpiresAt = new Date() + 100 anos;
} else {
  planType = 'free';
  planExpiresAt = new Date() + 15 dias;
}
```

---

## 7. Boas Práticas

### ✅ Fazer
- Sempre validar role antes de operações sensíveis
- Usar guards para proteger rotas
- Logar tentativas de acesso não autorizado
- Usar decoradores para melhor legibilidade
- Verificar role no frontend também (UX)

### ❌ Não Fazer
- Confiar apenas em validação frontend
- Armazenar role em localStorage sem validação
- Permitir alteração de role por usuário comum
- Usar role como única validação de segurança
- Expor informações sensíveis baseado em role

---

## 8. Exemplos de Uso

### Exemplo 1: Criar Usuário Admin
```typescript
// Apenas SUPER_ADMIN pode fazer isso
POST /api/users
Authorization: Bearer {super_admin_token}

{
  "email": "novo_admin@email.com",
  "password": "senha_segura",
  "role": "admin"
}

// Response
{
  "id": "uuid",
  "email": "novo_admin@email.com",
  "role": "admin",
  "planType": "lifetime",
  "planExpiresAt": "2126-03-14"
}
```

### Exemplo 2: Adicionar Vendedor ao Estabelecimento
```typescript
// Apenas OWNER ou ADMIN do estabelecimento
POST /api/business/establishments/:id/users
Authorization: Bearer {owner_token}

{
  "email": "vendedor@email.com",
  "role": "business_sales"
}

// Response
{
  "id": "uuid",
  "email": "vendedor@email.com",
  "businessRole": "business_sales",
  "establishmentId": "uuid"
}
```

### Exemplo 3: Criar Venda (Apenas SALES)
```typescript
// Apenas SALES, ADMIN ou OWNER podem criar
POST /api/business/sales
Authorization: Bearer {sales_token}

{
  "items": [...],
  "total": 100.00
}

// Se role não for autorizado
// Response 403
{
  "statusCode": 403,
  "message": "Acesso negado - apenas vendedores podem criar vendas",
  "error": "Forbidden"
}
```

---

**Última atualização**: Março 2026
**Versão**: 1.0.0
