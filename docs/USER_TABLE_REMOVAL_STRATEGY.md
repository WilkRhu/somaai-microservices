# Estratégia de Remoção da Tabela User do Monolith

## Objetivo
Remover a tabela `user` do monolith mantendo as funcionalidades que dependem de dados do usuário, usando o `userId` do JWT token.

## Arquitetura Proposta

### 1. Fluxo de Autenticação
```
Frontend
  ↓
Auth Service (cria usuário, gera JWT com userId)
  ↓
JWT Token contém: { userId, email, role, ... }
  ↓
Monolith (extrai userId do token, sem chamar auth)
```

### 2. Dados do Usuário no Monolith

**O que REMOVER:**
- Tabela `user` (não será mais necessária)
- Tabela `user_profile` (dados de perfil vêm do auth)
- Tabela `user_card` (dados de cartão vêm do auth)
- Tabela `user_address` (dados de endereço vêm do auth)

**O que MANTER:**
- Referências a `userId` em outras tabelas (purchases, subscriptions, etc)
- Sincronização de dados essenciais via Kafka (opcional, para cache)

### 3. Implementação em Passos

#### Passo 1: Criar Decorator para Extrair userId do JWT
```typescript
// common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user.id; // Vem do JWT decodificado
  },
);
```

#### Passo 2: Criar UserContext Service (Cache Opcional)
```typescript
// common/services/user-context.service.ts
// Armazena dados do usuário em cache (Redis ou memória)
// Sincronizado via Kafka quando auth cria/atualiza usuário
```

#### Passo 3: Atualizar Rotas do Monolith
- Remover `userId` como parâmetro
- Usar `@CurrentUser()` decorator
- Exemplo:
  ```typescript
  @Post('purchases')
  @UseGuards(JwtAuthGuard)
  createPurchase(
    @Body() dto: CreatePurchaseDto,
    @CurrentUser() userId: string
  ) {
    return this.purchaseService.create(userId, dto);
  }
  ```

#### Passo 4: Remover Tabela User
- Criar migration para remover tabelas user-related
- Atualizar entities
- Remover UsersModule ou deixar apenas para rotas internas

### 4. Dados que Precisam Ser Sincronizados

Se precisar de dados do usuário no monolith (nome, email, etc):

**Opção A: Cache com Kafka (Recomendado)**
```
Auth Service publica: UserCreated, UserUpdated
  ↓
Monolith consome via Kafka
  ↓
Armazena em Redis/Cache
  ↓
Usa quando precisa
```

**Opção B: Chamar Auth Service (Simples)**
```
Monolith precisa de dados
  ↓
Faz chamada HTTP ao Auth Service
  ↓
Cache resultado por tempo X
```

### 5. Rotas que Precisam Ser Atualizadas

**Antes:**
```
POST /api/users/:userId/purchases
GET /api/users/:userId/profile
PUT /api/users/:userId
```

**Depois:**
```
POST /api/purchases (userId vem do JWT)
GET /api/profile (userId vem do JWT)
PUT /api/profile (userId vem do JWT)
```

### 6. Checklist de Implementação

- [ ] Criar decorator `@CurrentUser()`
- [ ] Criar `UserContextService` (cache)
- [ ] Atualizar todas as rotas do monolith
- [ ] Remover `userId` dos DTOs de entrada
- [ ] Criar migration para remover tabelas user
- [ ] Testar autenticação com JWT
- [ ] Testar sincronização de dados via Kafka
- [ ] Remover UsersModule ou deixar apenas interno

### 7. Exemplo de Implementação

**Antes:**
```typescript
@Post(':userId/purchases')
async createPurchase(
  @Param('userId') userId: string,
  @Body() dto: CreatePurchaseDto
) {
  return this.purchaseService.create(userId, dto);
}
```

**Depois:**
```typescript
@Post('purchases')
@UseGuards(JwtAuthGuard)
async createPurchase(
  @Body() dto: CreatePurchaseDto,
  @CurrentUser() userId: string
) {
  return this.purchaseService.create(userId, dto);
}
```

### 8. Benefícios

✅ Sem latência de chamadas ao auth a cada operação
✅ Dados sincronizados via eventos (Kafka)
✅ Tabela user centralizada no auth service
✅ Monolith fica mais leve
✅ Melhor separação de responsabilidades

### 9. Próximos Passos

1. Implementar decorator `@CurrentUser()`
2. Criar `UserContextService`
3. Atualizar rotas do monolith
4. Criar migrations
5. Testar fluxo completo
