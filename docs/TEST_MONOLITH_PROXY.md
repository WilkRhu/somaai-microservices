# Teste: Proxy para Monolith

## Pré-requisitos

- Auth Service rodando em 3010
- Monolith rodando em 3000
- Orchestrador rodando em 3009

## Passo 1: Fazer Login

```bash
curl -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Resposta esperada:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "...",
  "user": {
    "id": "f210679e-4627-4e02-806b-3138275c011f",
    "email": "test@example.com"
  }
}
```

**Copie o `accessToken`.**

## Passo 2: Testar Rota de Compras

### 2.1 Listar Compras do Usuário

```bash
curl -X GET http://localhost:3009/api/monolith/users/f210679e-4627-4e02-806b-3138275c011f/purchases \
  -H "Authorization: Bearer <TOKEN_AQUI>"
```

**Resposta esperada:**
```json
[
  {
    "id": "purchase-1",
    "userId": "f210679e-4627-4e02-806b-3138275c011f",
    "total": 100.00,
    "status": "completed"
  }
]
```

### 2.2 Criar Compra

```bash
curl -X POST http://localhost:3009/api/monolith/users/f210679e-4627-4e02-806b-3138275c011f/purchases \
  -H "Authorization: Bearer <TOKEN_AQUI>" \
  -H "Content-Type: application/json" \
  -d '{
    "total": 150.00,
    "status": "pending",
    "items": [
      {
        "productId": "prod-1",
        "quantity": 2,
        "price": 75.00
      }
    ]
  }'
```

**Resposta esperada:**
```json
{
  "id": "purchase-2",
  "userId": "f210679e-4627-4e02-806b-3138275c011f",
  "total": 150.00,
  "status": "pending",
  "items": [...]
}
```

### 2.3 Obter Compra Específica

```bash
curl -X GET http://localhost:3009/api/monolith/users/f210679e-4627-4e02-806b-3138275c011f/purchases/purchase-1 \
  -H "Authorization: Bearer <TOKEN_AQUI>"
```

**Resposta esperada:**
```json
{
  "id": "purchase-1",
  "userId": "f210679e-4627-4e02-806b-3138275c011f",
  "total": 100.00,
  "status": "completed"
}
```

### 2.4 Atualizar Compra

```bash
curl -X PUT http://localhost:3009/api/monolith/users/f210679e-4627-4e02-806b-3138275c011f/purchases/purchase-1 \
  -H "Authorization: Bearer <TOKEN_AQUI>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shipped"
  }'
```

**Resposta esperada:**
```json
{
  "id": "purchase-1",
  "userId": "f210679e-4627-4e02-806b-3138275c011f",
  "total": 100.00,
  "status": "shipped"
}
```

### 2.5 Deletar Compra

```bash
curl -X DELETE http://localhost:3009/api/monolith/users/f210679e-4627-4e02-806b-3138275c011f/purchases/purchase-1 \
  -H "Authorization: Bearer <TOKEN_AQUI>"
```

**Resposta esperada:**
```json
{
  "success": true
}
```

## Passo 3: Testar Rotas Diretas de Compras

### 3.1 Listar Todas as Compras

```bash
curl -X GET http://localhost:3009/api/monolith/purchases \
  -H "Authorization: Bearer <TOKEN_AQUI>"
```

### 3.2 Criar Compra Diretamente

```bash
curl -X POST http://localhost:3009/api/monolith/purchases \
  -H "Authorization: Bearer <TOKEN_AQUI>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "f210679e-4627-4e02-806b-3138275c011f",
    "total": 200.00,
    "status": "pending"
  }'
```

## Passo 4: Verificar Swagger

Acesse:
```
http://localhost:3009/api/docs
```

Procure por "Monolith" na seção de tags. Você deve ver todas as rotas disponíveis.

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

- [ ] Login funcionando
- [ ] Token foi copiado
- [ ] Listar compras funcionando
- [ ] Criar compra funcionando
- [ ] Obter compra funcionando
- [ ] Atualizar compra funcionando
- [ ] Deletar compra funcionando
- [ ] Rotas diretas funcionando
- [ ] Swagger mostrando rotas

## Próximos Passos

Se tudo funcionou:

1. ✓ Testar com dados reais
2. ✓ Testar com diferentes usuários
3. ✓ Testar com permissões diferentes
4. ✓ Testar com dados inválidos

Se houver erro:

1. Verificar logs do orchestrador
2. Verificar logs do monolith
3. Verificar se o token está sendo passado
4. Consultar documentação de autenticação

## Referências

- Solução: `docs/MONOLITH_PROXY_SOLUTION.md`
- Autenticação: `docs/AUTH_COMMUNICATION_FLOW.md`
- Rotas: `docs/BACKEND_ROUTES.md`
