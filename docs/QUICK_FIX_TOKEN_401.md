# Quick Fix: Token Validation 401

## Problema

Auth Service está retornando 401 ao validar o token.

## Solução Rápida (2 minutos)

### 1. Verificar JWT_SECRET

```bash
# Todos devem ser iguais
grep JWT_SECRET services/auth/.env
grep JWT_SECRET services/monolith/.env
grep JWT_SECRET services/orchestrator/.env
```

Se forem diferentes, atualizar para usar o mesmo valor.

### 2. Fazer Login Novamente

```bash
curl -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Copie o novo `accessToken`.

### 3. Testar Imediatamente

```bash
# Testar no monolith
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer <TOKEN_NOVO>"

# Testar no orchestrador
curl -X POST http://localhost:3009/api/monolith/users/f210679e-4627-4e02-806b-3138275c011f/purchases \
  -H "Authorization: Bearer <TOKEN_NOVO>" \
  -H "Content-Type: application/json" \
  -d '{"total": 100.00, "status": "pending"}'
```

## Se Ainda Não Funcionar

1. Verificar se JWT_EXPIRATION é 3600 ou maior
2. Verificar se Auth Service está rodando
3. Verificar logs do auth service
4. Consultar `docs/TOKEN_VALIDATION_ISSUE.md`

## Referências

- Problema detalhado: `docs/TOKEN_VALIDATION_ISSUE.md`
- Autenticação: `docs/AUTH_COMMUNICATION_FLOW.md`
- Teste: `docs/FINAL_TEST_GUIDE.md`
