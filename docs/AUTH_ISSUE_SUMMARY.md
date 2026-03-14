# Resumo: Erro 401 - Missing Authorization Header

## Problema

```
ERROR [AuthGuard] Auth guard error: Missing authorization header
ERROR [ExceptionsHandler] Monolith service error: 401 - {"statusCode":401,"message":"Unauthorized"}
```

O orchestrador está tentando chamar o monolith, mas o monolith está rejeitando porque não está recebendo o header de autorização.

## Fluxo Esperado

```
Frontend
  ↓ (com token)
Orchestrador (porta 3002)
  ↓ (passa token para businessService)
businessService.proxyRequest()
  ↓ (faz requisição HTTP com Authorization header)
Monolith (porta 3000)
  ↓ (valida token com Auth Service)
Auth Service (porta 3010)
  ↓ (retorna validação)
Monolith
  ↓ (retorna dados)
Orchestrador
  ↓
Frontend
```

## Checklist de Verificação

### 1. Serviços Rodando

```bash
# Verificar se os serviços estão rodando
curl http://localhost:3010/api/auth/me  # Auth Service
curl http://localhost:3000/api/users/profile  # Monolith
curl http://localhost:3002/api/business/establishments  # Orchestrador
```

Se retornar erro de conexão, iniciar os serviços:

```bash
# Terminal 1
cd services/auth && npm run start

# Terminal 2
cd services/monolith && npm run start

# Terminal 3
cd services/orchestrator && npm run start
```

### 2. Configuração de Ambiente

Verificar se as URLs estão corretas:

```bash
# Monolith deve conhecer Auth Service
grep AUTH_SERVICE_URL services/monolith/.env
# Esperado: AUTH_SERVICE_URL=http://localhost:3010

# Orchestrador deve conhecer Monolith
grep MONOLITH_SERVICE_URL services/orchestrator/.env
# Esperado: MONOLITH_SERVICE_URL=http://localhost:3011 (Business Service)
```

### 3. JWT_SECRET Igual

```bash
# Todos devem ter o mesmo JWT_SECRET
grep JWT_SECRET services/auth/.env
grep JWT_SECRET services/monolith/.env
grep JWT_SECRET services/orchestrator/.env
```

### 4. Testar Fluxo Completo

```bash
# 1. Fazer login
TOKEN=$(curl -s -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# 2. Testar no monolith
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer $TOKEN"

# 3. Testar no orchestrador
curl -X GET http://localhost:3002/api/business/establishments \
  -H "Authorization: Bearer $TOKEN"
```

## Possíveis Causas

| Causa | Sintoma | Solução |
|-------|---------|---------|
| Serviço não rodando | Connection refused | Iniciar o serviço |
| Token não sendo passado | Missing authorization header | Verificar se o header está sendo enviado |
| Token expirado | Invalid token | Fazer login novamente |
| JWT_SECRET diferente | Invalid token | Usar o mesmo JWT_SECRET em todos os serviços |
| Auth Service não respondendo | Timeout | Verificar se Auth Service está rodando |
| Banco de dados não acessível | Database error | Verificar conexão com banco de dados |

## Logs para Verificar

### Auth Service
```
[AuthService] Token validation failed
[JwtStrategy] Invalid token
```

### Monolith
```
[AuthGuard] Auth guard error: Missing authorization header
[AuthValidationService] Token validation failed
```

### Orchestrador
```
[BusinessController] Missing authorization header
[BusinessService] Proxy request failed
```

## Próximos Passos

1. Executar o script de teste: `scripts/test-auth-flow.ps1` (Windows) ou `scripts/test-auth-flow.sh` (Linux)
2. Verificar os logs de cada serviço
3. Se ainda houver erro, consultar `docs/AUTH_COMMUNICATION_FLOW.md` para entender o fluxo completo

## Referências

- Fluxo de autenticação: `docs/AUTH_COMMUNICATION_FLOW.md`
- Solução detalhada: `docs/AUTH_HEADER_FIX.md`
- Quick start: `docs/QUICK_START_AUTH_DEBUG.md`
