# Resumo Visual: Erro 401 - Missing Authorization Header

## O Problema

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│                    (com token no header)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ORCHESTRADOR                               │
│                      (porta 3002)                               │
│                                                                 │
│  ✓ Recebe token do frontend                                    │
│  ✓ Passa token para businessService                            │
│  ✓ businessService faz proxy para monolith                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       MONOLITH                                  │
│                      (porta 3000)                               │
│                                                                 │
│  ✗ ERRO: Missing authorization header                          │
│  ✗ Retorna 401 Unauthorized                                    │
└─────────────────────────────────────────────────────────────────┘
```

## A Solução

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│                    (com token no header)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ORCHESTRADOR                               │
│                      (porta 3002)                               │
│                                                                 │
│  ✓ Recebe token do frontend                                    │
│  ✓ Extrai token: req.headers.authorization                     │
│  ✓ Passa token para businessService                            │
│  ✓ businessService faz proxy com Authorization header          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       MONOLITH                                  │
│                      (porta 3000)                               │
│                                                                 │
│  ✓ Recebe Authorization header                                 │
│  ✓ Valida token com Auth Service                               │
│  ✓ Retorna dados (200 OK)                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUTH SERVICE                                 │
│                      (porta 3010)                               │
│                                                                 │
│  ✓ Valida JWT usando JWT_SECRET                                │
│  ✓ Retorna validação                                           │
└─────────────────────────────────────────────────────────────────┘
```

## Passo a Passo

### 1️⃣ Iniciar Serviços

```
┌─────────────────────────────────────────────────────────────────┐
│ Terminal 1: Auth Service                                        │
│ $ cd services/auth && npm run start                             │
│ ✓ Rodando em http://localhost:3010                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Terminal 2: Monolith                                            │
│ $ cd services/monolith && npm run start                         │
│ ✓ Rodando em http://localhost:3000                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Terminal 3: Orchestrador                                        │
│ $ cd services/orchestrator && npm run start                     │
│ ✓ Rodando em http://localhost:3002                             │
└─────────────────────────────────────────────────────────────────┘
```

### 2️⃣ Fazer Login

```
┌─────────────────────────────────────────────────────────────────┐
│ $ curl -X POST http://localhost:3010/api/auth/login \           │
│   -H "Content-Type: application/json" \                         │
│   -d '{"email":"test@example.com","password":"password123"}'    │
│                                                                 │
│ Response:                                                       │
│ {                                                               │
│   "accessToken": "eyJhbGciOiJIUzI1NiIs...",                    │
│   "refreshToken": "...",                                        │
│   "user": { "id": "...", "email": "test@example.com" }         │
│ }                                                               │
│                                                                 │
│ ✓ Copie o accessToken                                          │
└─────────────────────────────────────────────────────────────────┘
```

### 3️⃣ Testar no Monolith

```
┌─────────────────────────────────────────────────────────────────┐
│ $ curl -X GET http://localhost:3000/api/users/profile \         │
│   -H "Authorization: Bearer <TOKEN_AQUI>"                       │
│                                                                 │
│ Response:                                                       │
│ {                                                               │
│   "id": "...",                                                  │
│   "email": "test@example.com",                                  │
│   "firstName": "John",                                          │
│   "lastName": "Doe",                                            │
│   "isActive": true                                              │
│ }                                                               │
│                                                                 │
│ ✓ Funcionando!                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4️⃣ Testar no Orchestrador

```
┌─────────────────────────────────────────────────────────────────┐
│ $ curl -X GET http://localhost:3002/api/business/establishments │
│   -H "Authorization: Bearer <TOKEN_AQUI>"                       │
│                                                                 │
│ Response:                                                       │
│ [                                                               │
│   {                                                             │
│     "id": "est-1",                                              │
│     "name": "Establishment 1",                                  │
│     "userId": "..."                                             │
│   }                                                             │
│ ]                                                               │
│                                                                 │
│ ✓ Funcionando!                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Árvore de Decisão

```
Erro 401 - Missing authorization header?
│
├─ Serviço está rodando?
│  ├─ ❌ Não → Iniciar serviço
│  └─ ✓ Sim → Continuar
│
├─ Conseguiu fazer login?
│  ├─ ❌ Não → Verificar credenciais
│  └─ ✓ Sim → Continuar
│
├─ Token está sendo enviado?
│  ├─ ❌ Não → Adicionar header Authorization
│  └─ ✓ Sim → Continuar
│
├─ Formato do header está correto?
│  ├─ ❌ Não → Usar: Authorization: Bearer <token>
│  └─ ✓ Sim → Continuar
│
├─ JWT_SECRET é igual em todos os serviços?
│  ├─ ❌ Não → Usar o mesmo JWT_SECRET
│  └─ ✓ Sim → Continuar
│
└─ ✓ Autenticação funcionando!
```

## Checklist

```
Inicialização
  ☐ Auth Service rodando em 3010
  ☐ Monolith rodando em 3000
  ☐ Orchestrador rodando em 3002

Configuração
  ☐ JWT_SECRET igual em todos os serviços
  ☐ AUTH_SERVICE_URL correto no Monolith
  ☐ MONOLITH_SERVICE_URL correto no Orchestrador

Teste
  ☐ Conseguiu fazer login
  ☐ Token foi copiado
  ☐ Teste no Monolith funcionou
  ☐ Teste no Orchestrador funcionou

Sucesso
  ☐ Autenticação funcionando
  ☐ Pronto para usar em produção
```

## Referências Rápidas

| Documento | Descrição | Tempo |
|-----------|-----------|-------|
| `AUTH_QUICK_FIX.md` | Solução rápida | 5 min |
| `AUTH_ISSUE_SUMMARY.md` | Resumo do problema | 10 min |
| `QUICK_START_AUTH_DEBUG.md` | Quick start | 15 min |
| `AUTH_TROUBLESHOOTING_VISUAL.md` | Guia visual | 20 min |
| `AUTH_COMMUNICATION_FLOW.md` | Fluxo completo | 30 min |
| `AUTH_HEADER_FIX.md` | Solução detalhada | 45 min |

## Próximos Passos

1. ✓ Siga os 4 passos acima
2. ✓ Verifique o checklist
3. ✓ Se funcionar, testar com dados reais
4. ✓ Se não funcionar, consultar documentação mais detalhada

## Suporte

```
Problema: Connection refused
Solução: Iniciar o serviço

Problema: Invalid credentials
Solução: Verificar email/senha

Problema: Missing authorization header
Solução: Adicionar header Authorization

Problema: Invalid token
Solução: Fazer login novamente

Problema: Unauthorized
Solução: Verificar JWT_SECRET
```

---

**Última atualização**: 14/03/2026
**Status**: ✓ Documentação Completa
