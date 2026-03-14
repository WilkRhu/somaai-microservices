# Solução: Proxy para Monolith no Orchestrador

## Problema

O frontend estava tentando chamar:
```
POST http://localhost:3009/api/monolith/users/f210679e-4627-4e02-806b-3138275c011f/purchases
```

Mas o orchestrador não tinha essa rota, resultando em erro `401 - Missing authorization header`.

## Solução Implementada

Adicionei um novo módulo `MonolithModule` no orchestrador que funciona como proxy para o monolith.

### Arquivos Criados

1. **`services/orchestrator/src/monolith/monolith.controller.ts`**
   - Controller com rotas proxy para o monolith
   - Suporta operações CRUD em purchases

2. **`services/orchestrator/src/monolith/monolith.service.ts`**
   - Service que faz proxy das requisições para o monolith
   - Passa o token de autorização corretamente

3. **`services/orchestrator/src/monolith/monolith.module.ts`**
   - Módulo que agrupa controller e service

### Rotas Disponíveis

#### User Purchases
```
GET    /api/monolith/users/:userId/purchases
POST   /api/monolith/users/:userId/purchases
GET    /api/monolith/users/:userId/purchases/:purchaseId
PUT    /api/monolith/users/:userId/purchases/:purchaseId
DELETE /api/monolith/users/:userId/purchases/:purchaseId
```

#### Direct Purchases Access
```
GET    /api/monolith/purchases
POST   /api/monolith/purchases
GET    /api/monolith/purchases/:purchaseId
PUT    /api/monolith/purchases/:purchaseId
DELETE /api/monolith/purchases/:purchaseId
```

## Como Funciona

```
Frontend
  │
  ├─ POST /api/monolith/users/userId/purchases
  │  Headers: { Authorization: "Bearer <token>" }
  │
  ▼
Orchestrador (porta 3009)
  │
  ├─ MonolithController: Recebe requisição
  ├─ Extrai token do header
  ├─ MonolithService: Faz proxy para monolith
  │
  ▼
Monolith (porta 3000)
  │
  ├─ AuthGuard: Valida token
  ├─ Controller: Processa requisição
  │
  ▼
Frontend recebe resposta
```

## Exemplo de Uso

### 1. Fazer Login

```bash
curl -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Copie o `accessToken`.

### 2. Criar Compra

```bash
curl -X POST http://localhost:3009/api/monolith/users/f210679e-4627-4e02-806b-3138275c011f/purchases \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "total": 100.00,
    "status": "pending",
    "items": [...]
  }'
```

### 3. Listar Compras

```bash
curl -X GET http://localhost:3009/api/monolith/users/f210679e-4627-4e02-806b-3138275c011f/purchases \
  -H "Authorization: Bearer <TOKEN>"
```

## Verificação

### 1. Verificar se o módulo foi carregado

```bash
# Verificar logs do orchestrador
# Procure por: "MonolithModule loaded"
```

### 2. Testar a rota

```bash
# Sem autenticação (deve retornar 401)
curl -X GET http://localhost:3009/api/monolith/purchases

# Com autenticação (deve funcionar)
curl -X GET http://localhost:3009/api/monolith/purchases \
  -H "Authorization: Bearer <TOKEN>"
```

### 3. Verificar Swagger

```
http://localhost:3009/api/docs
```

Procure por "Monolith" na seção de tags.

## Fluxo de Autenticação

```
Frontend (com token)
    ↓
Orchestrador (3009)
    ├─ AuthGuard: Valida header
    ├─ MonolithController: Extrai token
    └─ MonolithService: Faz proxy com token
    ↓
Monolith (3000)
    ├─ AuthGuard: Valida token
    └─ Controller: Processa requisição
    ↓
Frontend recebe resposta
```

## Possíveis Erros

### Erro: 401 Unauthorized

**Causa**: Token não está sendo enviado ou está expirado

**Solução**: 
1. Fazer login novamente
2. Copiar novo token
3. Enviar no header `Authorization: Bearer <token>`

### Erro: 404 Not Found

**Causa**: Rota não existe no monolith

**Solução**: Verificar se a rota existe no monolith

### Erro: 500 Internal Server Error

**Causa**: Erro no monolith ou na conexão

**Solução**: Verificar logs do monolith

## Próximos Passos

1. ✓ Testar a rota com autenticação
2. ✓ Verificar se o token está sendo passado corretamente
3. ✓ Testar com dados reais
4. ✓ Verificar logs se houver erro

## Referências

- Fluxo de autenticação: `docs/AUTH_COMMUNICATION_FLOW.md`
- Rotas do backend: `docs/BACKEND_ROUTES.md`
- Arquitetura: `docs/ARCHITECTURE.md`
