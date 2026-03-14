# Guia Final de Teste

## Objetivo

Testar o fluxo completo de autenticação e proxy do monolith.

## Pré-requisitos

- Auth Service rodando em 3010
- Monolith rodando em 3000
- Orchestrador rodando em 3009

## Passo 1: Fazer Login

```bash
curl -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Resposta esperada:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "...",
  "user": {
    "id": "f210679e-4627-4e02-806b-3138275c011f",
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true
  }
}
```

**Copie o `accessToken` e o `id` do usuário.**

## Passo 2: Testar no Monolith Diretamente

```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer <TOKEN_AQUI>"
```

**Resposta esperada:**
```json
{
  "id": "f210679e-4627-4e02-806b-3138275c011f",
  "email": "test@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "isActive": true
}
```

**Se funcionar**: Prosseguir para Passo 3

**Se não funcionar**: 
- Verificar logs do monolith
- Procurar por: "Auth guard error" ou "Token validation failed"
- Consultar `docs/FINAL_AUTH_FIX.md`

## Passo 3: Testar Proxy do Monolith via Orchestrador

### 3.1 Listar Compras

```bash
curl -X GET http://localhost:3009/api/monolith/users/f210679e-4627-4e02-806b-3138275c011f/purchases \
  -H "Authorization: Bearer <TOKEN_AQUI>"
```

**Resposta esperada:**
```json
[
  {
    "id": "purchase-1",
    "userId": "f210679e-4627-4e02-806b-3138275c011f",
    "total": 100.00,
    "status": "completed"
  }
]
```

### 3.2 Criar Compra

```bash
curl -X POST http://localhost:3009/api/monolith/users/f210679e-4627-4e02-806b-3138275c011f/purchases \
  -H "Authorization: Bearer <TOKEN_AQUI>" \
  -H "Content-Type: application/json" \
  -d '{
    "total": 150.00,
    "status": "pending",
    "items": [
      {
        "productId": "prod-1",
        "quantity": 2,
        "price": 75.00
      }
    ]
  }'
```

**Resposta esperada:**
```json
{
  "id": "purchase-2",
  "userId": "f210679e-4627-4e02-806b-3138275c011f",
  "total": 150.00,
  "status": "pending",
  "items": [...]
}
```

## Passo 4: Verificar Logs

### Logs do Orchestrador

Procure por:
```
DEBUG [MonolithService] Proxying POST http://localhost:3000/api/users/...
DEBUG [MonolithService] Authorization header: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Logs do Monolith

Procure por:
```
DEBUG [AuthGuard] Validating token: eyJhbGciOiJIUzI1NiIs...
DEBUG [AuthValidationService] Validating token with auth service
DEBUG [AuthValidationService] Token validated for user: f210679e-4627-4e02-806b-3138275c011f
DEBUG [AuthGuard] User injected in request: f210679e-4627-4e02-806b-3138275c011f
```

### Logs do Auth Service

Procure por:
```
DEBUG [AuthValidationService] Validating token with auth service
DEBUG [AuthValidationService] Token validated for user: f210679e-4627-4e02-806b-3138275c011f
```

## Possíveis Erros

### Erro: 401 Unauthorized

**Causa**: Token não está sendo validado

**Solução**:
1. Verificar se Auth Service está rodando
2. Verificar se AUTH_SERVICE_URL está correto no monolith
3. Verificar se JWT_SECRET é igual em auth service e monolith
4. Fazer login novamente

### Erro: 403 Forbidden

**Causa**: userId do parâmetro não bate com userId do token

**Solução**:
1. Verificar se o userId está correto
2. Usar o userId retornado no login

### Erro: 404 Not Found

**Causa**: Rota não existe

**Solução**:
1. Verificar se a rota está correta
2. Verificar se o monolith está rodando

### Erro: 500 Internal Server Error

**Causa**: Erro no monolith ou na conexão

**Solução**:
1. Verificar logs do monolith
2. Verificar se o banco de dados está acessível

## Checklist

- [ ] Login funcionando
- [ ] Token foi copiado
- [ ] Teste no monolith diretamente funcionou
- [ ] Listar compras via orchestrador funcionou
- [ ] Criar compra via orchestrador funcionou
- [ ] Logs mostram fluxo correto
- [ ] Sem erros 401 ou 403

## Próximos Passos

Se tudo funcionou:

1. ✓ Testar com dados reais
2. ✓ Testar com diferentes usuários
3. ✓ Testar com permissões diferentes
4. ✓ Testar com dados inválidos

Se houver erro:

1. Verificar logs detalhados
2. Consultar `docs/FINAL_AUTH_FIX.md`
3. Consultar `docs/DEBUG_401_ERROR.md`
4. Consultar `docs/AUTH_COMMUNICATION_FLOW.md`

## Referências

- Autenticação: `docs/AUTH_COMMUNICATION_FLOW.md`
- Debug: `docs/DEBUG_401_ERROR.md`
- Solução: `docs/FINAL_AUTH_FIX.md`
- Proxy: `docs/MONOLITH_PROXY_SOLUTION.md`
