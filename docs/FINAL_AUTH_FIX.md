# Solução Final: Erro 401 - Token Validation

## Problema

O monolith está retornando 401 porque o token está sendo rejeitado. O log mostra:

```
DEBUG [MonolithService] Proxying POST http://localhost:3000/api/users/f210679e-4627-4e02-806b-3138275c011f/purchases with headers: ["Content-Type","Authorization"]
ERROR [MonolithService] Proxy request failed: POST http://localhost:3000/api/users/f210679e-4627-4e02-806b-3138275c011f/purchases    Request failed with status code 401
```

## Causa Raiz

O decorator `@ValidateUserId` está verificando se `request.user?.id` existe. Se não existir, retorna erro 401.

```typescript
const tokenUserId = request.user?.id;

if (!tokenUserId) {
  throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
}
```

Isso significa que o AuthGuard não está injetando o usuário corretamente no request.

## Verificação

### 1. Verificar se o Auth Service está respondendo

```bash
curl -X POST http://localhost:3010/api/auth/verify-token \
  -H "Authorization: Bearer <TOKEN>" \
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

### 2. Verificar se o Monolith consegue chamar o Auth Service

Procure nos logs do monolith por:
```
DEBUG [AuthValidationService] Validating token with auth service
DEBUG [AuthValidationService] Token validated for user: f210679e-4627-4e02-806b-3138275c011f
```

Se não aparecer, significa que o monolith não consegue chamar o auth service.

### 3. Verificar se o Token está sendo passado corretamente

Procure nos logs do monolith por:
```
DEBUG [AuthGuard] Validating token: eyJhbGciOiJIUzI1NiIs...
DEBUG [AuthGuard] Token validated for user: f210679e-4627-4e02-806b-3138275c011f
```

Se não aparecer, significa que o token não está sendo passado corretamente.

## Solução

### Passo 1: Verificar se o Auth Service está rodando

```bash
curl http://localhost:3010/api/auth/me
```

Se retornar erro de conexão, iniciar o auth service:
```bash
cd services/auth && npm run start
```

### Passo 2: Verificar se o Monolith consegue chamar o Auth Service

Verificar a variável de ambiente `AUTH_SERVICE_URL` no monolith:

```bash
grep AUTH_SERVICE_URL services/monolith/.env
# Esperado: AUTH_SERVICE_URL=http://localhost:3010
```

Se estiver diferente, atualizar para `http://localhost:3010`.

### Passo 3: Verificar se o Token está sendo passado corretamente

Testar manualmente:

```bash
# 1. Fazer login
TOKEN=$(curl -s -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# 2. Testar no monolith diretamente
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer $TOKEN"

# 3. Se funcionar, testar no orchestrador
curl -X POST http://localhost:3009/api/monolith/users/f210679e-4627-4e02-806b-3138275c011f/purchases \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"total": 100.00, "status": "pending"}'
```

## Checklist

- [ ] Auth Service rodando em 3010
- [ ] Monolith rodando em 3000
- [ ] Orchestrador rodando em 3009
- [ ] AUTH_SERVICE_URL correto no monolith
- [ ] MONOLITH_SERVICE_URL correto no orchestrador
- [ ] JWT_SECRET igual em auth service e monolith
- [ ] Token foi obtido com sucesso
- [ ] Token está sendo enviado no header Authorization
- [ ] Formato do header é: `Authorization: Bearer <token>`
- [ ] Monolith consegue chamar auth service
- [ ] Token está sendo validado corretamente

## Logs para Verificar

### Auth Service
```
[AuthService] Token validation successful
[JwtStrategy] Token decoded successfully
```

### Monolith
```
[AuthGuard] Validating token: eyJhbGciOiJIUzI1NiIs...
[AuthValidationService] Validating token with auth service
[AuthValidationService] Token validated for user: f210679e-4627-4e02-806b-3138275c011f
[AuthGuard] Token validated for user: f210679e-4627-4e02-806b-3138275c011f
```

### Orchestrador
```
[MonolithService] Proxying POST http://localhost:3000/api/users/...
[MonolithService] Authorization header: Bearer eyJhbGciOiJIUzI1NiIs...
```

## Próximos Passos

1. Verificar os logs de cada serviço
2. Seguir o checklist de verificação
3. Testar manualmente cada etapa
4. Se ainda houver erro, consultar documentação de autenticação

## Referências

- Autenticação: `docs/AUTH_COMMUNICATION_FLOW.md`
- Debug: `docs/DEBUG_401_ERROR.md`
- Proxy: `docs/MONOLITH_PROXY_SOLUTION.md`
