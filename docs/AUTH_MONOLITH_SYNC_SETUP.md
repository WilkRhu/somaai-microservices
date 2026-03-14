# Auth to Monolith Sync - Guia de Setup

## Instalação

### 1. Instalar Dependências no Auth Service

```bash
cd services/auth
npm install @nestjs/axios --legacy-peer-deps
```

### 2. Configurar Variáveis de Ambiente

**services/auth/.env**

Adicionar ou atualizar:
```env
# Monolith Service
MONOLITH_SERVICE_URL=http://localhost:3001
```

Se estiver usando Docker:
```env
# Monolith Service (Docker)
MONOLITH_SERVICE_URL=http://monolith:3001
```

### 3. Verificar Arquivos Criados

Auth Service:
- ✅ `services/auth/src/common/services/monolith-sync.service.ts`
- ✅ `services/auth/src/common/services/services.module.ts`

Monolith Service:
- ✅ `services/monolith/src/users/dto/sync-from-auth.dto.ts`
- ✅ `services/monolith/src/users/services/user-sync.service.ts`

### 4. Verificar Modificações

Auth Service:
- ✅ `services/auth/src/auth/auth.module.ts` - Importa ServicesModule
- ✅ `services/auth/src/auth/auth.service.ts` - Injeta MonolithSyncService
- ✅ `services/auth/src/app.module.ts` - Importa HttpModule
- ✅ `services/auth/package.json` - Adiciona @nestjs/axios

Monolith Service:
- ✅ `services/monolith/src/users/users.controller.ts` - Adiciona UsersInternalController
- ✅ `services/monolith/src/users/users.module.ts` - Importa UserSyncService

## Verificação

### 1. Compilação

```bash
# Auth Service
cd services/auth
npm run build

# Monolith Service
cd services/monolith
npm run build
```

### 2. Testes Manuais

#### Teste 1: Registrar Novo Usuário

```bash
curl -X POST http://localhost:3010/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "1234567890"
  }'
```

Resposta esperada:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true
  }
}
```

#### Teste 2: Verificar Sincronização

```bash
# Usar o ID do usuário retornado no teste anterior
curl -X GET http://localhost:3001/api/users/internal/check/550e8400-e29b-41d4-a716-446655440000 \
  -H "X-Internal-Service: auth-service"
```

Resposta esperada:
```json
{
  "exists": true
}
```

#### Teste 3: Obter Usuário do Monolith

```bash
curl -X GET http://localhost:3001/api/users/550e8400-e29b-41d4-a716-446655440000
```

Resposta esperada:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "test@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "1234567890",
  "isActive": true,
  "createdAt": "2026-03-14T03:45:00.000Z",
  "updatedAt": "2026-03-14T03:45:00.000Z"
}
```

### 3. Verificar Logs

#### Auth Service

```bash
# Procurar por logs de sincronização
# Deve conter:
# - "Synced user {userId} to monolith"
# - "Published user.created event for user: {userId}"
```

#### Monolith Service

```bash
# Procurar por logs de sincronização
# Deve conter:
# - "Successfully synced user {userId} from auth to monolith"
```

## Troubleshooting

### Erro: "Cannot find module '@nestjs/axios'"

**Solução:**
```bash
cd services/auth
npm install @nestjs/axios --legacy-peer-deps
```

### Erro: "Unauthorized - Invalid internal service"

**Causa:** Header `X-Internal-Service` não está sendo enviado ou tem valor incorreto

**Solução:** Verificar se o header está sendo enviado corretamente:
```bash
curl -X GET http://localhost:3001/api/users/internal/check/{userId} \
  -H "X-Internal-Service: auth-service"
```

### Erro: "User not found" ao verificar sincronização

**Causa:** Usuário não foi sincronizado com sucesso

**Verificar:**
1. Se o Monolith está rodando
2. Se `MONOLITH_SERVICE_URL` está configurado corretamente
3. Logs do Auth Service para erros de conexão

### Erro: "Connection refused"

**Causa:** Monolith não está acessível

**Solução:**
1. Verificar se o Monolith está rodando: `curl http://localhost:3001/health`
2. Verificar se a URL está correta em `.env`
3. Se usar Docker, verificar se os containers estão na mesma rede

## Próximos Passos

### 1. Implementar Retry Automático

Adicionar retry automático para sincronizações falhadas:

```typescript
// services/auth/src/common/services/monolith-sync.service.ts

async syncUserToMonolith(user: User, retries: number = 3): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      // ... código de sincronização
      return;
    } catch (error) {
      if (i === retries - 1) throw error;
      await this.delay(1000 * (i + 1)); // Exponential backoff
    }
  }
}

private delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### 2. Implementar Fila de Sincronização

Usar Redis ou RabbitMQ para fila de sincronização:

```typescript
// Adicionar ao MonolithSyncService
async queueUserSync(user: User): Promise<void> {
  await this.redisService.lpush('user-sync-queue', JSON.stringify(user));
}
```

### 3. Implementar Circuit Breaker

Usar biblioteca como `opossum` para circuit breaker:

```bash
npm install opossum
```

### 4. Adicionar Testes de Integração

```typescript
// services/auth/test/integration/monolith-sync.integration.spec.ts

describe('MonolithSync Integration', () => {
  it('should sync user to monolith on registration', async () => {
    // Test implementation
  });

  it('should handle monolith connection failure gracefully', async () => {
    // Test implementation
  });
});
```

### 5. Implementar Sincronização Bidirecional

Permitir que o Monolith atualize dados no Auth:

```typescript
// services/monolith/src/users/services/user-sync.service.ts

async updateUserInAuth(userId: string, updateDto: UpdateUserDto): Promise<void> {
  // Implementar chamada HTTP para Auth Service
}
```

## Monitoramento

### Métricas Recomendadas

1. **Taxa de Sucesso de Sincronização**
   - Sincronizações bem-sucedidas / Total de sincronizações

2. **Tempo de Resposta**
   - Tempo médio de sincronização
   - P95 e P99 de tempo de sincronização

3. **Erros de Conexão**
   - Número de falhas de conexão
   - Tipos de erro mais comuns

### Alertas Recomendados

1. Taxa de sucesso < 95%
2. Tempo de resposta > 5 segundos
3. Mais de 10 erros de conexão em 5 minutos

## Documentação Adicional

- [AUTH_MONOLITH_SYNC_IMPLEMENTATION.md](./AUTH_MONOLITH_SYNC_IMPLEMENTATION.md) - Documentação técnica completa
- [AUTH_MONOLITH_SYNC_DIAGRAM.md](./AUTH_MONOLITH_SYNC_DIAGRAM.md) - Diagramas de arquitetura

## Checklist de Deployment

- [ ] Instalar @nestjs/axios no Auth Service
- [ ] Configurar MONOLITH_SERVICE_URL em .env
- [ ] Compilar Auth Service
- [ ] Compilar Monolith Service
- [ ] Iniciar Monolith Service
- [ ] Iniciar Auth Service
- [ ] Testar registro de novo usuário
- [ ] Verificar sincronização
- [ ] Verificar logs
- [ ] Testar com Google OAuth
- [ ] Testar com múltiplos usuários
- [ ] Testar com falha de conexão
- [ ] Configurar monitoramento
- [ ] Configurar alertas
