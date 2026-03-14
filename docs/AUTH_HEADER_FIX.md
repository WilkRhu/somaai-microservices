# Solução: Missing Authorization Header no Monolith

## Problema

O monolith está retornando erro `401 - Missing authorization header` quando o orchestrador tenta fazer requisições.

```
ERROR [AuthGuard] Auth guard error: Missing authorization header
ERROR [ExceptionsHandler] Monolith service error: 401 - {"statusCode":401,"message":"Unauthorized"}
```

## Causa Raiz

O orchestrador está passando o token corretamente para o businessService, mas há um problema na cadeia de validação:

1. **Orchestrador** recebe requisição com token
2. **Orchestrador** passa token para **businessService**
3. **businessService** faz proxy para **monolith** com o token
4. **Monolith** recebe requisição e valida com **auth service**
5. **Auth Service** valida o JWT

O problema está em uma das seguintes situações:

### Situação 1: Token não está sendo passado corretamente

No `businessController.ts`, o token está sendo extraído de `req.headers.authorization`, mas pode estar vindo como `undefined`.

**Solução**: Garantir que o token está sendo extraído corretamente.

### Situação 2: Auth Service não está respondendo

O monolith tenta validar o token com o auth service em `AuthValidationService.validateToken()`, mas o auth service pode não estar respondendo ou retornando erro.

**Solução**: Verificar se o auth service está rodando e se o endpoint `/api/auth/verify-token` está funcionando.

### Situação 3: JWT_SECRET diferente

Se o JWT_SECRET for diferente entre auth service e monolith, o token será rejeitado.

**Verificação**: Ambos têm o mesmo secret em `.env`:
```
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

## Solução Implementada

### 1. Verificar se os serviços estão rodando

```bash
# Terminal 1: Auth Service
cd services/auth
npm run start

# Terminal 2: Monolith
cd services/monolith
npm run start

# Terminal 3: Orchestrador
cd services/orchestrator
npm run start
```

### 2. Testar o fluxo de autenticação

```bash
# 1. Fazer login
curl -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Resposta esperada:
# {
#   "accessToken": "eyJhbGciOiJIUzI1NiIs...",
#   "refreshToken": "...",
#   "user": { "id": "...", "email": "test@example.com" }
# }

# 2. Copiar o accessToken e testar no monolith
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer <TOKEN_AQUI>"

# 3. Testar no orchestrador
curl -X GET http://localhost:3002/api/business/establishments \
  -H "Authorization: Bearer <TOKEN_AQUI>"
```

### 3. Verificar logs

Se ainda houver erro, verificar os logs:

```bash
# Auth Service
# Procurar por: "Token validation failed" ou "Invalid token"

# Monolith
# Procurar por: "Auth guard error" ou "Token validation failed"

# Orchestrador
# Procurar por: "Missing authorization header"
```

## Checklist de Verificação

- [ ] Auth Service está rodando na porta 3010
- [ ] Monolith está rodando na porta 3000
- [ ] Orchestrador está rodando na porta 3002
- [ ] JWT_SECRET é igual em auth service e monolith
- [ ] Token está sendo passado no header `Authorization: Bearer <token>`
- [ ] Auth Service consegue validar o token
- [ ] Monolith consegue chamar auth service para validar

## Próximos Passos

Se o problema persistir:

1. Verificar se há erro de conexão entre monolith e auth service
2. Verificar se o token está expirado
3. Verificar se o usuário existe no banco de dados
4. Verificar se o usuário está ativo (isActive = true)

## Referência

- Fluxo de autenticação: `docs/AUTH_COMMUNICATION_FLOW.md`
- Auth Service: `services/auth/src/auth/auth.controller.ts`
- Monolith Auth Guard: `services/monolith/src/common/guards/auth.guard.ts`
- Orchestrador Business Controller: `services/orchestrator/src/business/business.controller.ts`
