# Quick Fix: Erro 401 - Missing Authorization Header

## TL;DR

O monolith está rejeitando requisições do orchestrador porque o token não está sendo validado corretamente.

## Solução em 3 Passos

### 1. Iniciar os Serviços

```bash
# Terminal 1
cd services/auth && npm run start

# Terminal 2
cd services/monolith && npm run start

# Terminal 3
cd services/orchestrator && npm run start
```

### 2. Fazer Login

```bash
curl -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Copie o `accessToken` da resposta.

### 3. Testar

```bash
# Substitua <TOKEN> pelo token copiado

# Testar no Monolith
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer <TOKEN>"

# Testar no Orchestrador
curl -X GET http://localhost:3002/api/business/establishments \
  -H "Authorization: Bearer <TOKEN>"
```

## Se Ainda Não Funcionar

### Verificar Configuração

```bash
# Todos devem ter o mesmo JWT_SECRET
grep JWT_SECRET services/auth/.env
grep JWT_SECRET services/monolith/.env
grep JWT_SECRET services/orchestrator/.env

# Monolith deve conhecer Auth Service
grep AUTH_SERVICE_URL services/monolith/.env
# Esperado: http://localhost:3010

# Orchestrador deve conhecer Monolith
grep MONOLITH_SERVICE_URL services/orchestrator/.env
# Esperado: http://localhost:3011
```

### Verificar Logs

```bash
# Auth Service
# Procure por: "Token validation failed" ou "Invalid token"

# Monolith
# Procure por: "Auth guard error" ou "Token validation failed"

# Orchestrador
# Procure por: "Missing authorization header"
```

## Documentação Completa

- **Resumo**: `docs/AUTH_ISSUE_SUMMARY.md`
- **Solução Detalhada**: `docs/AUTH_HEADER_FIX.md`
- **Guia Visual**: `docs/AUTH_TROUBLESHOOTING_VISUAL.md`
- **Fluxo Completo**: `docs/AUTH_COMMUNICATION_FLOW.md`

## Scripts de Teste

- **Windows**: `scripts/test-auth-flow.ps1`
- **Linux/Mac**: `scripts/test-auth-flow.sh`

## Possíveis Erros

| Erro | Causa | Solução |
|------|-------|---------|
| Connection refused | Serviço não rodando | Iniciar o serviço |
| Invalid credentials | Email/senha errados | Verificar credenciais |
| Missing authorization header | Token não enviado | Adicionar header Authorization |
| Invalid token | Token expirado | Fazer login novamente |
| Unauthorized | JWT_SECRET diferente | Usar mesmo JWT_SECRET |

## Próximos Passos

1. Executar os 3 passos acima
2. Se funcionar, testar com dados reais
3. Se não funcionar, consultar documentação completa
