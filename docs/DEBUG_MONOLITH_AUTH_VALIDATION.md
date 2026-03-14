# Debug: Monolith Auth Validation Failing

## Problema

O token está sendo passado corretamente para o monolith, mas o monolith está retornando 401 ao tentar validar com o auth service.

```
DEBUG [MonolithService] Authorization header: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdW...
ERROR [MonolithService] Proxy request failed: POST http://localhost:3000/api/users/... - Request failed with status code 401
```

## Causa Possível

O monolith está tentando validar o token com o auth service, mas o auth service está retornando 401. Isso pode ser porque:

1. **Auth Service não está respondendo**
   - Serviço não está rodando
   - URL está incorreta

2. **Token é inválido para o Auth Service**
   - JWT_SECRET é diferente
   - Token foi gerado com um JWT_SECRET diferente

3. **Endpoint /api/auth/verify-token está falhando**
   - Endpoint não existe
   - Endpoint está retornando erro

## Como Debugar

### Passo 1: Verificar Logs do Monolith

Procure por:
```
DEBUG [AuthValidationService] Validating token with auth service: http://localhost:3010
DEBUG [AuthValidationService] Token to validate: eyJhbGciOiJIUzI1NiIs...
DEBUG [AuthValidationService] Calling: POST http://localhost:3010/api/auth/verify-token
ERROR [AuthValidationService] Auth service returned 401: ...
```

### Passo 2: Testar o Endpoint Diretamente

```bash
# 1. Fazer login
TOKEN=$(curl -s -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# 2. Testar o endpoint verify-token
curl -X POST http://localhost:3010/api/auth/verify-token \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Resposta esperada:**
```json
{
  "valid": true,
  "user": {
    "id": "f210679e-4627-4e02-806b-3138275c011f",
    "email": "test@example.com"
  }
}
```

**Se retornar 401:**
- Verificar se JWT_SECRET é igual em auth service e monolith
- Verificar se token expirou
- Verificar logs do auth service

### Passo 3: Verificar Logs do Auth Service

Procure por:
```
[JwtStrategy] Token decoded successfully
[AuthService] JWT validation successful
```

Se não aparecer, significa que o token está sendo rejeitado pelo JwtStrategy.

### Passo 4: Verificar JWT_SECRET

```bash
# Auth Service
grep JWT_SECRET services/auth/.env

# Monolith
grep JWT_SECRET services/monolith/.env

# Orchestrador
grep JWT_SECRET services/orchestrator/.env
```

**Esperado**: Todos devem ter o mesmo valor

### Passo 5: Verificar AUTH_SERVICE_URL

```bash
# Monolith
grep AUTH_SERVICE_URL services/monolith/.env
```

**Esperado**: `AUTH_SERVICE_URL=http://localhost:3010`

## Checklist

- [ ] Auth Service está rodando em 3010
- [ ] Endpoint /api/auth/verify-token está respondendo
- [ ] JWT_SECRET é igual em auth service e monolith
- [ ] AUTH_SERVICE_URL está correto no monolith
- [ ] Token foi obtido recentemente (não expirou)
- [ ] Token está sendo passado corretamente

## Próximos Passos

1. Executar os testes acima
2. Verificar os logs
3. Se ainda houver erro, consultar documentação de autenticação

## Referências

- Autenticação: `docs/AUTH_COMMUNICATION_FLOW.md`
- Token validation: `docs/TOKEN_VALIDATION_ISSUE.md`
- Quick fix: `docs/QUICK_FIX_TOKEN_401.md`
