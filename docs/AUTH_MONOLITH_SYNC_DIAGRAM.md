# Auth to Monolith Sync - Diagrama de Arquitetura

## Fluxo de Registro

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE                                 │
│                                                                 │
│  POST /api/auth/register                                        │
│  {                                                              │
│    email, password, firstName, lastName, phone                 │
│  }                                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUTH SERVICE                                 │
│                                                                 │
│  1. Validar dados                                               │
│  2. Hash password                                               │
│  3. Criar usuário no banco de dados                             │
│  4. Chamar MonolithSyncService                                  │
│                                                                 │
│     ┌──────────────────────────────────────────────────────┐   │
│     │ MonolithSyncService.syncUserToMonolith()             │   │
│     │                                                      │   │
│     │ POST /api/users/internal/sync-from-auth             │   │
│     │ Headers: X-Internal-Service: auth-service           │   │
│     │ Body: {id, email, firstName, lastName, ...}         │   │
│     └──────────────────────┬───────────────────────────────┘   │
│                            │                                    │
│  5. Publicar eventos Kafka │                                    │
│     - user.created         │                                    │
│     - registration.success │                                    │
│                            │                                    │
│  6. Gerar tokens JWT       │                                    │
│  7. Retornar resposta      │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MONOLITH SERVICE                              │
│                                                                 │
│  UsersInternalController                                        │
│  POST /api/users/internal/sync-from-auth                        │
│                                                                 │
│  1. Validar header X-Internal-Service                           │
│  2. Chamar UserSyncService.syncUserFromAuth()                   │
│                                                                 │
│     ┌──────────────────────────────────────────────────────┐   │
│     │ UserSyncService.syncUserFromAuth()                   │   │
│     │                                                      │   │
│     │ 1. Verificar se usuário existe                       │   │
│     │ 2. Se não existe: criar com mesmo ID do Auth         │   │
│     │ 3. Se existe: atualizar dados                        │   │
│     │ 4. Salvar no banco de dados                          │   │
│     │ 5. Retornar usuário criado/atualizado                │   │
│     └──────────────────────────────────────────────────────┘   │
│                                                                 │
│  3. Retornar resposta 201 Created                               │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE                                 │
│                                                                 │
│  Response 200 OK                                                │
│  {                                                              │
│    accessToken, refreshToken,                                  │
│    user: {id, email, firstName, lastName, isActive}            │
│  }                                                              │
│                                                                 │
│  ✓ Usuário criado no Auth                                       │
│  ✓ Usuário criado no Monolith com mesmo ID                      │
│  ✓ Tokens JWT gerados                                           │
│  ✓ Eventos Kafka publicados                                     │
└─────────────────────────────────────────────────────────────────┘
```

## Estrutura de Dados

### Auth Service - User Entity
```
┌─────────────────────────────────────┐
│ User (Auth Database)                │
├─────────────────────────────────────┤
│ id: UUID                            │
│ email: string (unique)              │
│ password: string (hashed)           │
│ firstName: string                   │
│ lastName: string                    │
│ phone: string (optional)            │
│ avatar: string (optional)           │
│ authProvider: EMAIL|GOOGLE|FACEBOOK │
│ googleId: string (optional)         │
│ role: USER|BUSINESS_OWNER|ADMIN     │
│ isActive: boolean                   │
│ emailVerified: boolean              │
│ createdAt: timestamp                │
│ updatedAt: timestamp                │
│ lastLogin: timestamp                │
└─────────────────────────────────────┘
```

### Monolith Service - User Entity
```
┌─────────────────────────────────────┐
│ User (Monolith Database)            │
├─────────────────────────────────────┤
│ id: UUID (same as Auth)             │
│ email: string (unique)              │
│ firstName: string                   │
│ lastName: string                    │
│ phone: string (optional)            │
│ avatar: string (optional)           │
│ authProvider: EMAIL|GOOGLE|FACEBOOK │
│ googleId: string (optional)         │
│ role: USER|BUSINESS_OWNER|ADMIN     │
│ isActive: boolean                   │
│ emailVerified: boolean              │
│ cpf: string (optional)              │
│ birthDate: date (optional)          │
│ planType: string (optional)         │
│ ... (outros campos específicos)     │
│ createdAt: timestamp                │
│ updatedAt: timestamp                │
│ lastLogin: timestamp                │
└─────────────────────────────────────┘
```

## Componentes

### Auth Service
```
services/auth/
├── src/
│   ├── auth/
│   │   ├── auth.service.ts (modificado)
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts (modificado)
│   │   └── ...
│   ├── common/
│   │   └── services/
│   │       ├── monolith-sync.service.ts (novo)
│   │       └── services.module.ts (novo)
│   ├── app.module.ts (modificado)
│   └── ...
├── .env (modificado)
└── package.json (modificado)
```

### Monolith Service
```
services/monolith/
├── src/
│   ├── users/
│   │   ├── users.service.ts
│   │   ├── users.controller.ts (modificado)
│   │   ├── users.module.ts (modificado)
│   │   ├── dto/
│   │   │   ├── sync-from-auth.dto.ts (novo)
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── user-sync.service.ts (novo)
│   │   │   └── ...
│   │   └── entities/
│   │       ├── user.entity.ts
│   │       └── ...
│   └── ...
```

## Fluxo de Erro

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTH SERVICE                                 │
│                                                                 │
│  Usuário criado com sucesso                                     │
│  ↓                                                              │
│  Tentar sincronizar com Monolith                                │
│  ↓                                                              │
│  ❌ Erro de conexão / Timeout                                    │
│  ↓                                                              │
│  ✓ Log do erro                                                  │
│  ✓ Não falhar o registro                                        │
│  ✓ Retornar sucesso ao cliente                                  │
│  ↓                                                              │
│  Usuário criado no Auth                                         │
│  Usuário NÃO criado no Monolith (ainda)                         │
│                                                                 │
│  Próximas ações:                                                │
│  - Implementar retry automático                                 │
│  - Implementar fila de sincronização                            │
│  - Sincronização manual via admin                               │
└─────────────────────────────────────────────────────────────────┘
```

## Segurança

### Validação de Header

```
┌─────────────────────────────────────────────────────────────────┐
│                   MONOLITH SERVICE                              │
│                                                                 │
│  POST /api/users/internal/sync-from-auth                        │
│                                                                 │
│  Headers recebidos:                                             │
│  X-Internal-Service: auth-service                               │
│                                                                 │
│  ✓ Validação bem-sucedida                                       │
│  ✓ Processar requisição                                         │
│                                                                 │
│  ---                                                            │
│                                                                 │
│  Headers recebidos:                                             │
│  X-Internal-Service: unknown-service                            │
│                                                                 │
│  ❌ Validação falhou                                             │
│  ❌ Retornar 401 Unauthorized                                    │
│                                                                 │
│  ---                                                            │
│                                                                 │
│  Headers recebidos:                                             │
│  (sem X-Internal-Service)                                       │
│                                                                 │
│  ❌ Validação falhou                                             │
│  ❌ Retornar 401 Unauthorized                                    │
└─────────────────────────────────────────────────────────────────┘
```

## Sequência de Eventos Kafka

```
1. user.created
   {
     userId: string,
     email: string,
     firstName: string,
     lastName: string,
     authProvider: string,
     timestamp: Date
   }

2. registration.success
   {
     userId: string,
     email: string,
     timestamp: Date
   }

3. login.success (se aplicável)
   {
     userId: string,
     email: string,
     timestamp: Date
   }
```

## Configuração de Ambiente

```
AUTH SERVICE (.env)
├── MONOLITH_SERVICE_URL=http://localhost:3001
└── (outras variáveis existentes)

MONOLITH SERVICE
└── (nenhuma configuração adicional necessária)
```

## Dependências Adicionadas

```
Auth Service - package.json
├── "@nestjs/axios": "^3.0.0"
└── (outras dependências existentes)

Monolith Service
└── (nenhuma dependência adicional necessária)
```
