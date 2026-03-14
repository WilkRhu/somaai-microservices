# Auth to Monolith User Synchronization

## Overview

Implementação de sincronização automática de usuários entre o serviço de Auth e o Monolith. Quando um usuário se registra no Auth, ele é automaticamente criado no Monolith com o mesmo ID.

## Arquitetura

### Fluxo de Registro

```
1. Usuário se registra no Auth Service
   ↓
2. Usuário é criado no banco de dados do Auth
   ↓
3. MonolithSyncService faz uma chamada HTTP interna para o Monolith
   ↓
4. Monolith recebe a requisição e cria o usuário com o mesmo ID
   ↓
5. Eventos Kafka são publicados (user.created, registration.success)
```

## Componentes Implementados

### 1. Auth Service - MonolithSyncService

**Arquivo:** `services/auth/src/common/services/monolith-sync.service.ts`

Serviço responsável por sincronizar usuários com o Monolith:

```typescript
- syncUserToMonolith(user: User): Promise<void>
  Sincroniza um usuário criado no Auth com o Monolith
  
- checkUserExistsInMonolith(userId: string): Promise<boolean>
  Verifica se um usuário já existe no Monolith
```

**Características:**
- Usa HttpService do NestJS para fazer requisições HTTP
- Envia header `X-Internal-Service: auth-service` para autenticação interna
- Não falha o registro se a sincronização falhar (graceful degradation)
- Logging detalhado de sucesso e erro

### 2. Auth Service - Atualização do AuthService

**Arquivo:** `services/auth/src/auth/auth.service.ts`

Modificações:
- Injeção do `MonolithSyncService`
- Chamada a `syncUserToMonolith()` após criar usuário no método `register()`
- Chamada a `syncUserToMonolith()` após criar usuário Google no método `googleLogin()`

### 3. Monolith - UserSyncService

**Arquivo:** `services/monolith/src/users/services/user-sync.service.ts`

Serviço responsável por receber e processar sincronizações:

```typescript
- syncUserFromAuth(syncDto: SyncFromAuthDto): Promise<User>
  Sincroniza um usuário do Auth, criando ou atualizando no Monolith
  
- checkUserExists(userId: string): Promise<boolean>
  Verifica se um usuário existe
  
- getUserById(userId: string): Promise<User>
  Obtém um usuário pelo ID
```

**Características:**
- Cria usuário com o mesmo ID do Auth
- Atualiza dados se o usuário já existir
- Usa transações do TypeORM para garantir consistência

### 4. Monolith - Rotas Internas

**Arquivo:** `services/monolith/src/users/users.controller.ts`

Novo controller: `UsersInternalController`

Rotas:
- `POST /api/users/internal/sync-from-auth` - Sincroniza usuário do Auth
- `GET /api/users/internal/check/:userId` - Verifica se usuário existe

**Segurança:**
- Todas as rotas validam o header `X-Internal-Service`
- Apenas requisições com `X-Internal-Service: auth-service` são aceitas
- Retorna 401 Unauthorized se o header for inválido

### 5. DTOs

**Arquivo:** `services/monolith/src/users/dto/sync-from-auth.dto.ts`

```typescript
export class SyncFromAuthDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  authProvider: string;
  role: string;
  emailVerified: boolean;
}
```

## Configuração

### Variáveis de Ambiente

**Auth Service (.env):**
```
MONOLITH_SERVICE_URL=http://localhost:3001
```

**Monolith Service:**
Nenhuma configuração adicional necessária (usa header de validação)

### Dependências

**Auth Service - package.json:**
```json
"@nestjs/axios": "^3.0.0"
```

## Fluxo Detalhado

### Registro de Usuário (Email)

1. Cliente envia POST `/api/auth/register` com email, senha, nome
2. AuthService valida e cria usuário no banco de dados do Auth
3. MonolithSyncService é chamado com os dados do usuário
4. MonolithSyncService faz POST para `/api/users/internal/sync-from-auth`
5. Monolith recebe requisição, valida header `X-Internal-Service`
6. UserSyncService cria usuário no Monolith com o mesmo ID
7. Tokens JWT são gerados e retornados ao cliente
8. Eventos Kafka são publicados

### Login com Google

1. Cliente envia POST `/api/auth/google/login` com Google ID token
2. AuthService valida token e verifica se usuário existe
3. Se novo usuário:
   - Cria usuário no banco de dados do Auth
   - Chama MonolithSyncService para sincronizar
   - Publica eventos Kafka
4. Se usuário existente:
   - Apenas atualiza last login
   - Publica evento de login bem-sucedido
5. Tokens JWT são gerados e retornados

## Tratamento de Erros

### Sincronização Falha

Se a sincronização com o Monolith falhar:
- O usuário é criado normalmente no Auth
- Um erro é logado
- O registro continua e retorna sucesso ao cliente
- O usuário pode ser sincronizado posteriormente via retry ou manual

### Usuário Já Existe

Se o usuário já existe no Monolith:
- Os dados são atualizados
- Nenhum erro é lançado
- Sincronização é considerada bem-sucedida

## Segurança

### Autenticação Interna

- Header `X-Internal-Service` é obrigatório
- Apenas `auth-service` é aceito como valor válido
- Requisições sem header ou com valor inválido retornam 401

### Dados Sensíveis

- Senha do usuário NÃO é sincronizada
- Apenas dados públicos são compartilhados
- Cada serviço mantém sua própria autenticação

## Monitoramento

### Logs

Todos os eventos são logados:
- Sincronização bem-sucedida
- Falhas de sincronização
- Erros de conexão
- Validações de header

### Métricas

Recomendado adicionar métricas para:
- Taxa de sucesso de sincronização
- Tempo de resposta da sincronização
- Erros de conexão com Monolith

## Próximos Passos

1. Implementar retry automático para sincronizações falhadas
2. Adicionar fila de sincronização (Redis/RabbitMQ)
3. Implementar sincronização bidirecional
4. Adicionar testes de integração
5. Implementar circuit breaker para falhas de conexão

## Testes

### Teste Manual

```bash
# 1. Registrar novo usuário
curl -X POST http://localhost:3010/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "1234567890"
  }'

# 2. Verificar se usuário foi criado no Monolith
curl -X GET http://localhost:3001/api/users/internal/check/{userId} \
  -H "X-Internal-Service: auth-service"
```

## Troubleshooting

### Erro: "Cannot find module '@nestjs/axios'"

Solução: Instalar dependência
```bash
cd services/auth
npm install @nestjs/axios
```

### Erro: "Unauthorized - Invalid internal service"

Solução: Verificar se o header `X-Internal-Service: auth-service` está sendo enviado

### Sincronização não funciona

Verificar:
1. Se `MONOLITH_SERVICE_URL` está configurado corretamente
2. Se o Monolith está rodando
3. Se há conectividade entre os serviços
4. Logs do Auth Service para erros de conexão
