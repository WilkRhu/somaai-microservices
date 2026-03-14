# Problema: Token Validation Failed - Auth Service Returning 401

## Problema

O monolith está tentando validar o token com o auth service, mas o auth service está retornando 401:

```
DEBUG [AuthValidationService] Validating token with auth service: http://localhost:3010
ERROR [AuthValidationService] Token validation failed: Request failed with status code 401
ERROR [AuthValidationService] Auth service returned 401: {"message":"Unauthorized","statusCode":401}
```

## Causa Raiz

O endpoint `/api/auth/verify-token` está usando `@UseGuards(JwtAuthGuard)`, que valida o token novamente. Se o token for inválido ou expirado, o JwtAuthGuard vai rejeitar.

### Possíveis Causas

1. **Token Expirado**
   - JWT_EXPIRATION pode ser muito curto
   - Token foi gerado há muito tempo

2. **JWT_SECRET Diferente**
   - Auth Service e Monolith têm JWT_SECRET diferentes
   - Token foi gerado com um JWT_SECRET diferente

3. **Token Inválido**
   - Token foi corrompido
   - Token foi gerado incorretamente

## Solução

### Passo 1: Verificar JWT_SECRET

```bash
# Auth Service
grep JWT_SECRET services/auth/.env

# Monolith
grep JWT_SECRET services/monolith/.env

# Orchestrador
grep JWT_SECRET services/orchestrator/.env
```

**Esperado**: Todos devem ter o mesmo valor

**Se diferente**: Atualizar para usar o mesmo JWT_SECRET

### Passo 2: Verificar JWT_EXPIRATION

```bash
# Auth Service
grep JWT_EXPIRATION services/auth/.env
```

**Esperado**: JWT_EXPIRATION=3600 (1 hora)

**Se muito curto**: Aumentar para 3600 ou mais

### Passo 3: Fazer Login Novamente

```bash
curl -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Copie o novo `accessToken`.**

### Passo 4: Testar o Token Imediatamente

```bash
# Testar no auth service
curl -X POST http://localhost:3010/api/auth/verify-token \
  -H "Authorization: Bearer <TOKEN_NOVO>" \
  -H "Content-Type: application/json"

# Testar no monolith
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer <TOKEN_NOVO>"

# Testar no orchestrador
curl -X POST http://localhost:3009/api/monolith/users/f210679e-4627-4e02-806b-3138275c011f/purchases \
  -H "Authorization: Bearer <TOKEN_NOVO>" \
  -H "Content-Type: application/json" \
  -d '{"total": 100.00, "status": "pending"}'
```

## Checklist

- [ ] JWT_SECRET é igual em auth service, monolith e orchestrador
- [ ] JWT_EXPIRATION é 3600 ou maior
- [ ] Fez login novamente
- [ ] Token foi copiado imediatamente após login
- [ ] Token está sendo testado imediatamente (não expirou)
- [ ] Teste no auth service funcionou
- [ ] Teste no monolith funcionou
- [ ] Teste no orchestrador funcionou

## Logs para Verificar

### Auth Service

```
[JwtStrategy] Token decoded successfully
[AuthService] JWT validation successful
```

### Monolith

```
[AuthGuard] Validating token: eyJhbGciOiJIUzI1NiIs...
[AuthValidationService] Validating token with auth service
[AuthValidationService] Token validated for user: f210679e-4627-4e02-806b-3138275c011f
[AuthGuard] User injected in request: f210679e-4627-4e02-806b-3138275c011f
```

## Próximos Passos

1. Verificar JWT_SECRET em todos os serviços
2. Verificar JWT_EXPIRATION
3. Fazer login novamente
4. Testar imediatamente após login
5. Se ainda houver erro, consultar documentação de autenticação

## Referências

- Autenticação: `docs/AUTH_COMMUNICATION_FLOW.md`
- Debug: `docs/DEBUG_401_ERROR.md`
- Teste: `docs/FINAL_TEST_GUIDE.md`
