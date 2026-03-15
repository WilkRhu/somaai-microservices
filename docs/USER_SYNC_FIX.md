# Correção: Usuário Não Sendo Criado na Tabela Monolith User

## Problema Identificado

O usuário **não estava sendo criado** na tabela `monolith.users` porque havia um **conflito de chave primária** entre os serviços.

### Causa Raiz

1. **Auth Service** (`services/auth/src/auth/entities/user.entity.ts`):
   ```typescript
   @PrimaryGeneratedColumn('uuid')
   id: string;
   ```
   - Gera UUID automaticamente no banco de dados

2. **Monolith Service** (`services/monolith/src/users/entities/user.entity.ts`):
   ```typescript
   @PrimaryColumn('uuid')
   id: string;

   @BeforeInsert()
   generateId() {
     if (!this.id) {
       this.id = randomUUID();
     }
   }
   ```
   - Tentava gerar um novo UUID no `@BeforeInsert()` mesmo quando o ID já era fornecido pelo auth

### Problema Secundário: Email Placeholder

Quando uma purchase era criada antes do usuário sincronizar, o `ensureUserExists` criava um usuário placeholder com email `{userId}@placeholder.local`. Isso causava:

1. **Conflito de constraint UNIQUE** se múltiplas purchases fossem criadas concorrentemente
2. **Email inválido** no banco de dados
3. **Dificuldade de atualização** quando o usuário real sincronizava

### Fluxo de Sincronização

Existem **dois caminhos** de sincronização:

#### 1. Sincronização HTTP (Direto)
```
Auth Service (register/googleLogin)
  ↓
MonolithSyncService.syncUserToMonolith()
  ↓
POST /api/users/internal/sync-from-auth
  ↓
UsersInternalController.syncUserFromAuth()
  ↓
UserSyncService.syncUserFromAuth()
  ↓
Salva na tabela monolith.users
```

#### 2. Sincronização Kafka (Assíncrona)
```
Auth Service (publishUserCreated)
  ↓
Kafka Topic: user.created
  ↓
MonolithConsumerService.handleUserCreated()
  ↓
UserSyncService.syncUserFromAuth()
  ↓
Salva na tabela monolith.users
```

## Soluções Aplicadas

### 1. Remover `@BeforeInsert()` do Monolith User Entity

**Arquivo**: `services/monolith/src/users/entities/user.entity.ts`

```typescript
// ANTES
@PrimaryColumn('uuid')
id: string;

@BeforeInsert()
generateId() {
  if (!this.id) {
    this.id = randomUUID();
  }
}

// DEPOIS
@PrimaryColumn('uuid')
id: string;
```

**Motivo**: O ID é sempre fornecido pelo auth service durante a sincronização, então não precisa gerar um novo.

### 2. Melhorar Email Placeholder com Idempotência

**Arquivo**: `services/monolith/src/purchases/purchases.service.ts`

```typescript
// ANTES
email: `${userId}@placeholder.local`

// DEPOIS
email: `placeholder-${userId}@system.local`
```

**Motivo**: 
- Garante unicidade mesmo com múltiplas tentativas concorrentes
- Usa UUID como base para evitar colisões
- Será atualizado quando o usuário real sincronizar

### 3. Adicionar Tratamento de Erro com Retry

**Arquivo**: `services/monolith/src/purchases/purchases.service.ts`

```typescript
try {
  await this.userSyncService.syncUserFromAuth({...});
} catch (error) {
  // Se falhar por constraint unique, o usuário já existe
  const stillExists = await this.userSyncService.checkUserExists(userId);
  if (!stillExists) {
    throw error;
  }
}
```

**Motivo**: Trata race conditions quando múltiplas requisições tentam criar o mesmo usuário placeholder.

### 4. Melhorar Sincronização com Detecção de Placeholder

**Arquivo**: `services/monolith/src/users/services/user-sync.service.ts`

```typescript
// Se o email atual é um placeholder, atualizar para o email real
const isPlaceholder = user.email.startsWith('placeholder-') && user.email.endsWith('@system.local');

if (isPlaceholder && syncDto.email !== user.email) {
  this.logger.log(`   - Updating placeholder email from ${user.email} to ${syncDto.email}`);
}

user.email = syncDto.email;
```

**Motivo**: Permite transição suave de usuários placeholder para usuários reais.

### 5. Melhorar Logging de Erros

**Arquivo**: `services/monolith/src/users/services/user-sync.service.ts`

```typescript
catch (error) {
  this.logger.error(`Error syncing user from auth: ${error.message}`);
  this.logger.error(`Error details:`, error);
  throw error;
}
```

## Verificação

### 1. Testar Sincronização HTTP

```bash
curl -X POST http://localhost:3000/api/users/internal/sync-from-auth \
  -H "X-Internal-Service: auth-service" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "phone": "11999999999",
    "avatar": null,
    "authProvider": "EMAIL",
    "role": "USER",
    "emailVerified": false
  }'
```

**Resposta esperada**: 201 Created com dados do usuário

### 2. Verificar Banco de Dados

```sql
SELECT * FROM somaai_monolith.users WHERE email = 'test@example.com';
```

**Esperado**: Uma linha com o usuário sincronizado

### 3. Testar Fluxo Completo

1. Registrar novo usuário no auth:
```bash
curl -X POST http://localhost:3010/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "Password123!",
    "firstName": "New",
    "lastName": "User",
    "phone": "11988888888"
  }'
```

2. Verificar se foi criado no monolith:
```bash
curl -X GET http://localhost:3000/api/users/internal/check/USER_ID \
  -H "X-Internal-Service: auth-service"
```

### 4. Testar Placeholder → Real Email Transition

1. Criar uma purchase (cria usuário placeholder):
```bash
curl -X POST http://localhost:3000/api/purchases \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "merchant": "Test Store",
    "amount": 100.00,
    "type": "PURCHASE"
  }'
```

2. Sincronizar usuário real:
```bash
curl -X POST http://localhost:3000/api/users/internal/sync-from-auth \
  -H "X-Internal-Service: auth-service" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "real@example.com",
    "firstName": "Real",
    "lastName": "User",
    ...
  }'
```

3. Verificar que o email foi atualizado:
```sql
SELECT id, email FROM somaai_monolith.users 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';
```

**Esperado**: Email atualizado de `placeholder-...@system.local` para `real@example.com`

## Logs Esperados

### Auth Service
```
✅ Successfully synced user {userId} to monolith
Published user.created event for user: {userId}
```

### Monolith Service
```
✅ User {userId} synced successfully
Successfully synced user {userId} from auth to monolith
   - Updating placeholder email from placeholder-{userId}@system.local to real@example.com
```

## Possíveis Problemas Residuais

### 1. Erro 401 - Invalid internal service header
- Verificar se o header `X-Internal-Service: auth-service` está sendo enviado
- Verificar se o valor é exatamente `auth-service` (case-sensitive)

### 2. Erro de Constraint Unique (email)
- Se houver tentativas duplicadas de sincronização com emails diferentes
- Verificar logs para identificar qual email está causando conflito
- Usar placeholder email para usuários temporários

### 3. Kafka não sincronizando
- Verificar se Kafka está rodando: `docker ps | grep kafka`
- Verificar logs do monolith consumer
- Verificar se o tópico `user.created` existe

### 4. Email Placeholder Permanente
- Se um usuário nunca sincronizar do auth, ficará com email placeholder
- Considerar adicionar job de limpeza para usuários antigos com placeholder email

## Próximos Passos

1. ✅ Remover `@BeforeInsert()` do User entity
2. ✅ Melhorar email placeholder com idempotência
3. ✅ Adicionar tratamento de erro com retry
4. ✅ Melhorar sincronização com detecção de placeholder
5. ✅ Melhorar logging de erros
6. Testar sincronização completa
7. Monitorar logs em produção
8. Considerar adicionar job de limpeza para usuários placeholder antigos
9. Considerar adicionar retry logic com exponential backoff

