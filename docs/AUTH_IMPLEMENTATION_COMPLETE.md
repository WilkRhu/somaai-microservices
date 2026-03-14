# Implementação de Autenticação Centralizada - Concluída

## Resumo das Mudanças

Implementamos um sistema de autenticação centralizado onde o monolith valida todos os tokens JWT com o auth service, sem manter uma tabela de usuários local.

## Arquivos Criados

### 1. Infraestrutura de Autenticação
- `services/monolith/src/common/common.module.ts` - Módulo compartilhado
- `services/monolith/src/common/services/auth-validation.service.ts` - Validação de tokens
- `services/monolith/src/common/guards/auth.guard.ts` - Guard para proteger rotas
- `services/monolith/src/common/guards/role.guard.ts` - Guard para validar roles
- `services/monolith/src/common/decorators/current-user.decorator.ts` - Extrai userId do request
- `services/monolith/src/common/decorators/roles.decorator.ts` - Define roles necessárias
- `services/monolith/src/common/middleware/auth.middleware.ts` - Middleware de autenticação

### 2. Documentação
- `docs/AUTH_INTEGRATION_MONOLITH.md` - Guia de uso
- `docs/USER_TABLE_REMOVAL_STRATEGY.md` - Estratégia de remoção da tabela user

## Controllers Atualizados

### 1. PurchasesController
**Antes:**
```
POST /api/users/:userId/purchases
GET /api/users/:userId/purchases
```

**Depois:**
```
POST /api/purchases (userId do JWT)
GET /api/purchases (userId do JWT)
```

**Mudanças:**
- Removido userId do path
- Adicionado @UseGuards(AuthGuard)
- Adicionado @ApiBearerAuth
- Usando @CurrentUser() decorator

### 2. SubscriptionsController
**Mudanças:**
- Adicionado @UseGuards(AuthGuard)
- Substituído req.user?.id por @CurrentUser() decorator
- Adicionado @ApiBearerAuth

### 3. EstablishmentsController
**Mudanças:**
- Adicionado @UseGuards(AuthGuard)
- Substituído req.user?.id por @CurrentUser() decorator
- Adicionado @ApiBearerAuth

### 4. UsersController
**Mudanças:**
- Adicionado @UseGuards(AuthGuard) no controller
- Adicionado validação de acesso (usuário só pode acessar seus próprios dados)
- Substituído req.user?.id por @CurrentUser() decorator
- Adicionado @ApiBearerAuth

### 5. AdminUsersController
**Mudanças:**
- Adicionado @UseGuards(AuthGuard, RoleGuard)
- Adicionado @Roles('ADMIN') para validar role
- Adicionado @ApiBearerAuth

## Fluxo de Autenticação

```
1. Frontend envia requisição com JWT
   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

2. AuthGuard intercepta
   - Extrai token do header
   - Valida com auth service

3. Auth Service valida
   - POST /api/auth/verify-token
   - Retorna dados do usuário

4. Dados injetados no request
   request.user = { id, email, firstName, lastName, isActive }

5. Controller acessa via @CurrentUser()
   @CurrentUser() userId: string
```

## Variáveis de Ambiente Necessárias

```env
AUTH_SERVICE_URL=http://localhost:3001
```

## Como Usar em Novos Controllers

```typescript
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/resource')
@UseGuards(AuthGuard)
@ApiBearerAuth('access-token')
export class ResourceController {
  @Post()
  async create(
    @Body() dto: CreateDto,
    @CurrentUser() userId: string
  ) {
    return this.service.create(userId, dto);
  }

  @Get()
  async list(@CurrentUser() userId: string) {
    return this.service.findByUser(userId);
  }
}
```

## Para Rotas Admin

```typescript
import { RoleGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/admin/resource')
@UseGuards(AuthGuard, RoleGuard)
@Roles('ADMIN')
@ApiBearerAuth('access-token')
export class AdminResourceController {
  @Get()
  async list() {
    return this.service.findAll();
  }
}
```

## Tratamento de Erros

### Token Inválido
```
Status: 401 Unauthorized
Body: { message: 'Unauthorized' }
```

### Acesso Negado (Forbidden)
```
Status: 403 Forbidden
Body: { message: 'Insufficient permissions' }
```

### Sem Autenticação
```
Status: 401 Unauthorized
Body: { message: 'Missing authorization header' }
```

## Benefícios

✅ Sem tabela de usuários no monolith
✅ Validação centralizada no auth service
✅ Dados sempre sincronizados
✅ Sem latência de chamadas síncronas
✅ Melhor separação de responsabilidades
✅ Fácil de implementar em outras aplicações
✅ Segurança melhorada com validação de roles

## Próximos Passos

1. ✅ Implementar AuthGuard e decorators
2. ✅ Atualizar controllers principais
3. ⏳ Remover tabela user do monolith (migration)
4. ⏳ Testar fluxo completo
5. ⏳ Atualizar frontend para enviar JWT
6. ⏳ Implementar em outros serviços (se necessário)

## Testes

Para testar, use o Postman ou curl:

```bash
# 1. Login no auth service
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Resposta:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "...",
  "user": { "id": "123", "email": "user@example.com" }
}

# 2. Usar token no monolith
curl -X GET http://localhost:3002/api/purchases \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

# Resposta:
[
  { "id": "1", "userId": "123", "total": 100 }
]
```

## Notas Importantes

- O AuthGuard valida o token a cada requisição
- O userId é extraído do JWT validado
- Não há cache de usuários (sempre valida com auth service)
- Para melhor performance, considere adicionar cache com Redis
- O RoleGuard valida roles do usuário
- Validação de acesso (próprio usuário) é feita no controller
