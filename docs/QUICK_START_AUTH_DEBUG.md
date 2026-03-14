# Quick Start: Debug de Autenticação

## Problema Atual

O monolith está retornando `401 - Missing authorization header` quando o orchestrador tenta fazer requisições.

## Solução Rápida

### Passo 1: Iniciar os Serviços

Abra 3 terminais diferentes e execute:

**Terminal 1 - Auth Service:**
```bash
cd services/auth
npm install  # Se necessário
npm run start
```

**Terminal 2 - Monolith:**
```bash
cd services/monolith
npm install  # Se necessário
npm run start
```

**Terminal 3 - Orchestrador:**
```bash
cd services/orchestrator
npm install  # Se necessário
npm run start
```

### Passo 2: Testar o Fluxo

Execute o script de teste:

**Windows (PowerShell):**
```powershell
.\scripts\test-auth-flow.ps1
```

**Linux/Mac (Bash):**
```bash
bash scripts/test-auth-flow.sh
```

### Passo 3: Verificar Logs

Se houver erro, procure nos logs por:

- **Auth Service**: "Token validation failed" ou "Invalid token"
- **Monolith**: "Auth guard error" ou "Token validation failed"
- **Orchestrador**: "Missing authorization header"

## Verificação Manual

Se preferir testar manualmente:

### 1. Fazer Login

```bash
curl -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Copie o `accessToken` da resposta.

### 2. Testar no Monolith

```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer <TOKEN_AQUI>"
```

Esperado: Retorna dados do usuário (200 OK)

### 3. Testar no Orchestrador

```bash
curl -X GET http://localhost:3002/api/business/establishments \
  -H "Authorization: Bearer <TOKEN_AQUI>"
```

Esperado: Retorna lista de estabelecimentos (200 OK)

## Possíveis Problemas

### Erro: "Cannot connect to server"

**Causa**: Serviço não está rodando

**Solução**: Verifique se o serviço foi iniciado corretamente

### Erro: "Invalid credentials"

**Causa**: Usuário não existe ou senha está errada

**Solução**: Crie um novo usuário ou use credenciais corretas

### Erro: "Missing authorization header"

**Causa**: Token não está sendo passado corretamente

**Solução**: Verifique se o header `Authorization: Bearer <token>` está sendo enviado

### Erro: "Invalid token"

**Causa**: Token expirou ou JWT_SECRET é diferente

**Solução**: 
1. Faça login novamente para obter novo token
2. Verifique se JWT_SECRET é igual em todos os serviços

## Verificação de Configuração

### Verificar JWT_SECRET

Todos os serviços devem ter o mesmo `JWT_SECRET`:

```bash
# Auth Service
grep JWT_SECRET services/auth/.env

# Monolith
grep JWT_SECRET services/monolith/.env

# Orchestrador
grep JWT_SECRET services/orchestrator/.env
```

Esperado: Todos retornam o mesmo valor

### Verificar URLs de Serviços

```bash
# Monolith deve conhecer Auth Service
grep AUTH_SERVICE_URL services/monolith/.env

# Orchestrador deve conhecer Monolith
grep MONOLITH_SERVICE_URL services/orchestrator/.env
```

## Próximos Passos

Se tudo funcionar:

1. Teste com dados reais
2. Verifique se as permissões estão corretas
3. Teste com diferentes tipos de usuários (admin, user, etc.)

Se ainda houver problemas:

1. Verifique os logs detalhados
2. Verifique a conectividade entre serviços
3. Verifique se o banco de dados está acessível
4. Verifique se o usuário existe no banco de dados

## Referências

- Fluxo de autenticação: `docs/AUTH_COMMUNICATION_FLOW.md`
- Solução detalhada: `docs/AUTH_HEADER_FIX.md`
- Rotas do backend: `docs/BACKEND_ROUTES.md`
