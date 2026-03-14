# Solução Completa: Proxy para Monolith

## Problema

O frontend estava tentando chamar:
```
POST http://localhost:3009/api/monolith/users/userId/purchases
```

Mas o orchestrador não tinha essa rota, resultando em erro `401 - Missing authorization header`.

## Solução

Adicionei um novo módulo `MonolithModule` no orchestrador que funciona como proxy para o monolith.

## Arquivos Criados

### Código
- `services/orchestrator/src/monolith/monolith.controller.ts`
- `services/orchestrator/src/monolith/monolith.service.ts`
- `services/orchestrator/src/monolith/monolith.module.ts`

### Documentação
- `docs/MONOLITH_PROXY_SOLUTION.md` - Solução detalhada
- `docs/TEST_MONOLITH_PROXY.md` - Instruções de teste

### Scripts
- `scripts/test-monolith-proxy.ps1` - Teste para Windows
- `scripts/test-monolith-proxy.sh` - Teste para Linux/Mac

## Rotas Disponíveis

### User Purchases
```
GET    /api/monolith/users/:userId/purchases
POST   /api/monolith/users/:userId/purchases
GET    /api/monolith/users/:userId/purchases/:purchaseId
PUT    /api/monolith/users/:userId/purchases/:purchaseId
DELETE /api/monolith/users/:userId/purchases/:purchaseId
```

### Direct Purchases Access
```
GET    /api/monolith/purchases
POST   /api/monolith/purchases
GET    /api/monolith/purchases/:purchaseId
PUT    /api/monolith/purchases/:purchaseId
DELETE /api/monolith/purchases/:purchaseId
```

## Como Usar

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

Copie o `accessToken`.

### 3. Testar a Rota

```bash
curl -X POST http://localhost:3009/api/monolith/users/userId/purchases \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "total": 100.00,
    "status": "pending"
  }'
```

### 4. Executar Script de Teste

**Windows:**
```powershell
.\scripts\test-monolith-proxy.ps1
```

**Linux/Mac:**
```bash
bash scripts/test-monolith-proxy.sh
```

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

## Verificação

### 1. Verificar Swagger

```
http://localhost:3009/api/docs
```

Procure por "Monolith" na seção de tags.

### 2. Verificar Logs

```bash
# Orchestrador
# Procure por: "MonolithController" ou "MonolithService"

# Monolith
# Procure por: "PurchasesController" ou erro de autenticação
```

### 3. Testar Manualmente

```bash
# Sem autenticação (deve retornar 401)
curl -X GET http://localhost:3009/api/monolith/purchases

# Com autenticação (deve funcionar)
curl -X GET http://localhost:3009/api/monolith/purchases \
  -H "Authorization: Bearer <TOKEN>"
```

## Possíveis Erros

### Erro: 401 Unauthorized

**Causa**: Token não está sendo enviado ou está expirado

**Solução**: 
1. Fazer login novamente
2. Copiar novo token
3. Enviar no header `Authorization: Bearer <token>`

### Erro: 404 Not Found

**Causa**: Rota não existe

**Solução**: Verificar se a rota está correta

### Erro: 500 Internal Server Error

**Causa**: Erro no monolith ou na conexão

**Solução**: Verificar logs do monolith

## Checklist

- [ ] Serviços rodando
- [ ] Login funcionando
- [ ] Token foi copiado
- [ ] Listar compras funcionando
- [ ] Criar compra funcionando
- [ ] Obter compra funcionando
- [ ] Atualizar compra funcionando
- [ ] Deletar compra funcionando
- [ ] Swagger mostrando rotas

## Próximos Passos

1. ✓ Testar a rota com autenticação
2. ✓ Verificar se o token está sendo passado corretamente
3. ✓ Testar com dados reais
4. ✓ Verificar logs se houver erro

## Referências

- Solução: `docs/MONOLITH_PROXY_SOLUTION.md`
- Teste: `docs/TEST_MONOLITH_PROXY.md`
- Autenticação: `docs/AUTH_COMMUNICATION_FLOW.md`
- Rotas: `docs/BACKEND_ROUTES.md`

---

**Status**: ✓ Solução Completa
**Data**: 14/03/2026
