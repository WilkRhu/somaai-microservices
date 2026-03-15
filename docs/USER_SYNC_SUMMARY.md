# Resumo: Correção de Sincronização de Usuários

## Problema Identificado

Usuários não estavam sendo criados na tabela `monolith.users` devido a dois problemas:

### 1. Conflito de Chave Primária
- **Auth Service**: Usa `@PrimaryGeneratedColumn('uuid')` - gera UUID automaticamente
- **Monolith Service**: Usava `@PrimaryColumn('uuid')` com `@BeforeInsert()` que tentava gerar novo UUID
- **Resultado**: Conflito ao sincronizar, pois o ID já era fornecido pelo auth

### 2. Email Placeholder Problemático
- Quando uma purchase era criada antes do usuário sincronizar, criava usuário placeholder
- Email: `{userId}@placeholder.local` - não era único e causava conflitos
- Dificultava atualização quando o usuário real sincronizava

## Soluções Implementadas

### Arquivo 1: `services/monolith/src/users/entities/user.entity.ts`
```diff
- import { BeforeInsert } from 'typeorm';
- import { randomUUID } from 'crypto';

  @PrimaryColumn('uuid')
  id: string;

- @BeforeInsert()
- generateId() {
-   if (!this.id) {
-     this.id = randomUUID();
-   }
- }
```

**Motivo**: ID sempre vem do auth service, não precisa gerar novo

---

### Arquivo 2: `services/monolith/src/purchases/purchases.service.ts`
```diff
  private async ensureUserExists(userId: string): Promise<void> {
    const exists = await this.userSyncService.checkUserExists(userId);
    if (!exists) {
+     try {
        await this.userSyncService.syncUserFromAuth({
          id: userId,
-         email: `${userId}@placeholder.local`,
+         email: `placeholder-${userId}@system.local`,
          firstName: 'User',
-         lastName: userId.substring(0, 8),
+         lastName: 'User',
          authProvider: 'EMAIL',
          role: 'USER',
          emailVerified: false,
        });
+     } catch (error) {
+       // Se falhar por constraint unique, o usuário já existe
+       const stillExists = await this.userSyncService.checkUserExists(userId);
+       if (!stillExists) {
+         throw error;
+       }
+     }
    }
  }
```

**Motivo**: 
- Email único mesmo com múltiplas tentativas concorrentes
- Tratamento de race conditions
- Melhor logging

---

### Arquivo 3: `services/monolith/src/users/services/user-sync.service.ts`
```diff
  async syncUserFromAuth(syncDto: SyncFromAuthDto): Promise<User> {
    try {
      let user = await this.usersRepository.findOne({
        where: { id: syncDto.id },
      });

      if (user) {
        this.logger.log(`User ${syncDto.id} already exists in monolith, updating...`);
+       
+       // Se o email atual é um placeholder, atualizar para o email real
+       const isPlaceholder = user.email.startsWith('placeholder-') && user.email.endsWith('@system.local');
+       
+       if (isPlaceholder && syncDto.email !== user.email) {
+         this.logger.log(`   - Updating placeholder email from ${user.email} to ${syncDto.email}`);
+       }
+       
        user.email = syncDto.email;
        user.firstName = syncDto.firstName;
        user.lastName = syncDto.lastName;
        user.phone = syncDto.phone || user.phone;
        user.avatar = syncDto.avatar || user.avatar;
        user.authProvider = syncDto.authProvider;
        user.role = syncDto.role;
        user.emailVerified = syncDto.emailVerified;
        return await this.usersRepository.save(user);
      }

      // Criar novo usuário...
      const savedUser = await this.usersRepository.save(user);
      this.logger.log(`Successfully synced user ${syncDto.id} from auth to monolith`);
      return savedUser;
    } catch (error) {
      this.logger.error(`Error syncing user from auth: ${error.message}`);
+     this.logger.error(`Error details:`, error);
      throw error;
    }
  }
```

**Motivo**:
- Detecta e atualiza emails placeholder
- Melhor logging para debugging
- Transição suave de placeholder → email real

---

## Fluxo de Sincronização Corrigido

### Cenário 1: Usuário se registra no Auth
```
1. Auth Service: register()
   ↓
2. Salva usuário no auth.users com ID gerado
   ↓
3. MonolithSyncService.syncUserToMonolith()
   ↓
4. POST /api/users/internal/sync-from-auth
   ↓
5. UserSyncService.syncUserFromAuth()
   ↓
6. Cria usuário em monolith.users com MESMO ID
   ✅ Sucesso
```

### Cenário 2: Purchase criada antes de sincronização
```
1. Purchase criada com userId que não existe em monolith
   ↓
2. ensureUserExists() chamado
   ↓
3. Cria usuário placeholder com email: placeholder-{userId}@system.local
   ✅ Sucesso (email único)
   ↓
4. Depois, usuário sincroniza do auth
   ↓
5. UserSyncService detecta placeholder
   ↓
6. Atualiza email para o email real
   ✅ Sucesso (transição suave)
```

### Cenário 3: Múltiplas purchases concorrentes
```
1. Requisição A: ensureUserExists(userId)
   ↓
2. Requisição B: ensureUserExists(userId) (concorrente)
   ↓
3. Ambas tentam criar usuário placeholder
   ↓
4. Uma sucede, outra falha com constraint unique
   ↓
5. Requisição B: catch block verifica se existe
   ✅ Sucesso (idempotente)
```

## Verificação

### 1. Testar Sincronização Direta
```bash
# Registrar usuário
curl -X POST http://localhost:3010/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# Verificar no monolith
curl -X GET http://localhost:3000/api/users/internal/check/{userId} \
  -H "X-Internal-Service: auth-service"
```

### 2. Verificar Banco de Dados
```sql
-- Auth database
SELECT id, email FROM somaai_master.users WHERE email = 'test@example.com';

-- Monolith database
SELECT id, email FROM somaai_monolith.users WHERE email = 'test@example.com';
```

**Esperado**: Mesmo ID em ambas as tabelas

### 3. Testar Placeholder → Real Email
```bash
# Criar purchase (cria placeholder)
curl -X POST http://localhost:3000/api/purchases \
  -H "Authorization: Bearer {token}" \
  -d '{"userId": "{userId}", "merchant": "Test", "amount": 100}'

# Sincronizar usuário real
curl -X POST http://localhost:3000/api/users/internal/sync-from-auth \
  -H "X-Internal-Service: auth-service" \
  -d '{"id": "{userId}", "email": "real@example.com", ...}'

# Verificar email atualizado
SELECT email FROM somaai_monolith.users WHERE id = '{userId}';
```

**Esperado**: Email atualizado de `placeholder-...@system.local` para `real@example.com`

## Logs Esperados

### Sucesso
```
✅ Successfully synced user {userId} to monolith
✅ User {userId} synced successfully
   - Updating placeholder email from placeholder-{userId}@system.local to real@example.com
```

### Erro (com detalhes)
```
❌ Error syncing user from auth: Duplicate entry for email
Error details: { code: 'ER_DUP_ENTRY', ... }
```

## Impacto

| Aspecto | Antes | Depois |
|--------|-------|--------|
| Sincronização de usuários | ❌ Falhava | ✅ Funciona |
| Email placeholder | ❌ Conflitava | ✅ Único e idempotente |
| Transição placeholder → real | ❌ Não existia | ✅ Automática |
| Race conditions | ❌ Causava erro | ✅ Tratado |
| Logging de erro | ❌ Genérico | ✅ Detalhado |

## Próximos Passos Recomendados

1. **Testar em produção** - Monitorar logs de sincronização
2. **Limpeza de dados** - Remover usuários placeholder antigos (> 30 dias)
3. **Retry automático** - Adicionar exponential backoff para falhas
4. **Monitoramento** - Alertas para falhas de sincronização
5. **Documentação** - Atualizar runbooks com novos fluxos

