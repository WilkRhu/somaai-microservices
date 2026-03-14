# Guia Visual: Troubleshooting de Autenticação

## Diagrama do Fluxo

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
│  AuthGuard: Valida se tem header Authorization                 │
│  BusinessController: Extrai token de req.headers.authorization │
│  BusinessService: Faz proxy para Monolith com token            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       MONOLITH                                  │
│                      (porta 3000)                               │
│                                                                 │
│  AuthGuard: Valida se tem header Authorization                 │
│  AuthValidationService: Valida token com Auth Service          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUTH SERVICE                                 │
│                      (porta 3010)                               │
│                                                                 │
│  JwtAuthGuard: Valida JWT usando JWT_SECRET                    │
│  AuthController: Retorna validação                             │
└─────────────────────────────────────────────────────────────────┘
```

## Passo 1: Verificar Serviços

### Status Esperado

```
✓ Auth Service rodando em http://localhost:3010
✓ Monolith rodando em http://localhost:3000
✓ Orchestrador rodando em http://localhost:3002
```

### Como Verificar

```bash
# Teste cada serviço
curl http://localhost:3010/api/auth/me
curl http://localhost:3000/api/users/profile
curl http://localhost:3002/api/business/establishments
```

### Se Falhar

```
❌ Connection refused
   → Serviço não está rodando
   → Solução: Iniciar o serviço

❌ 401 Unauthorized
   → Serviço está rodando mas precisa de autenticação
   → Solução: Fazer login primeiro
```

## Passo 2: Fazer Login

### Comando

```bash
curl -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Resposta Esperada

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "f210679e-4627-4e02-806b-3138275c011f",
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true
  }
}
```

### Se Falhar

```
❌ Invalid credentials
   → Email ou senha incorretos
   → Solução: Verificar credenciais ou criar novo usuário

❌ User not found
   → Usuário não existe
   → Solução: Criar novo usuário via POST /api/auth/register

❌ Connection refused
   → Auth Service não está rodando
   → Solução: Iniciar Auth Service
```

## Passo 3: Copiar Token

```bash
# Copie o valor de "accessToken" da resposta anterior
# Exemplo:
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Passo 4: Testar no Monolith

### Comando

```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Resposta Esperada

```json
{
  "id": "f210679e-4627-4e02-806b-3138275c011f",
  "email": "test@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "isActive": true
}
```

### Se Falhar

```
❌ Missing authorization header
   → Header Authorization não foi enviado
   → Solução: Adicionar header: Authorization: Bearer <token>

❌ Invalid authorization header format
   → Formato do header está errado
   → Solução: Usar formato: Authorization: Bearer <token>

❌ Invalid token
   → Token expirou ou JWT_SECRET é diferente
   → Solução: Fazer login novamente ou verificar JWT_SECRET

❌ Unauthorized
   → Token não é válido
   → Solução: Fazer login novamente
```

## Passo 5: Testar no Orchestrador

### Comando

```bash
curl -X GET http://localhost:3002/api/business/establishments \
  -H "Authorization: Bearer $TOKEN"
```

### Resposta Esperada

```json
[
  {
    "id": "est-1",
    "name": "Establishment 1",
    "userId": "f210679e-4627-4e02-806b-3138275c011f"
  }
]
```

### Se Falhar

```
❌ Missing authorization header
   → Header Authorization não foi enviado
   → Solução: Adicionar header: Authorization: Bearer <token>

❌ Monolith service error: 401
   → Monolith rejeitou o token
   → Solução: Verificar logs do Monolith

❌ Connection refused
   → Orchestrador não está rodando
   → Solução: Iniciar Orchestrador
```

## Árvore de Decisão

```
Erro 401 - Missing authorization header?
│
├─ Serviço está rodando?
│  ├─ Não → Iniciar serviço
│  └─ Sim → Continuar
│
├─ Token foi obtido?
│  ├─ Não → Fazer login
│  └─ Sim → Continuar
│
├─ Header Authorization está sendo enviado?
│  ├─ Não → Adicionar header
│  └─ Sim → Continuar
│
├─ Formato do header está correto?
│  ├─ Não (ex: "Bearer" faltando) → Corrigir formato
│  └─ Sim → Continuar
│
├─ Token está expirado?
│  ├─ Sim → Fazer login novamente
│  └─ Não → Continuar
│
├─ JWT_SECRET é igual em todos os serviços?
│  ├─ Não → Usar o mesmo JWT_SECRET
│  └─ Sim → Continuar
│
└─ Verificar logs detalhados
   ├─ Auth Service: grep "Token validation failed"
   ├─ Monolith: grep "Auth guard error"
   └─ Orchestrador: grep "Missing authorization header"
```

## Checklist Rápido

- [ ] Auth Service rodando em 3010
- [ ] Monolith rodando em 3000
- [ ] Orchestrador rodando em 3002
- [ ] Conseguiu fazer login
- [ ] Token foi copiado
- [ ] Header Authorization está sendo enviado
- [ ] Formato do header é: `Authorization: Bearer <token>`
- [ ] JWT_SECRET é igual em todos os serviços
- [ ] Monolith consegue chamar Auth Service
- [ ] Teste no Monolith funcionou
- [ ] Teste no Orchestrador funcionou

## Próximos Passos

Se tudo passou no checklist:

1. ✓ Autenticação está funcionando
2. Testar com dados reais
3. Testar com diferentes tipos de usuários
4. Testar com permissões diferentes

Se ainda houver problemas:

1. Verificar logs detalhados
2. Verificar conectividade entre serviços
3. Verificar banco de dados
4. Consultar `docs/AUTH_COMMUNICATION_FLOW.md`

## Referências Rápidas

| Arquivo | Descrição |
|---------|-----------|
| `docs/AUTH_ISSUE_SUMMARY.md` | Resumo do problema |
| `docs/AUTH_HEADER_FIX.md` | Solução detalhada |
| `docs/QUICK_START_AUTH_DEBUG.md` | Quick start |
| `docs/AUTH_COMMUNICATION_FLOW.md` | Fluxo completo |
| `scripts/test-auth-flow.ps1` | Script de teste (Windows) |
| `scripts/test-auth-flow.sh` | Script de teste (Linux) |
