# Guia de Testes - Phase 4 ✅

## 🚀 Como Testar

### 1. Iniciar os Serviços

```bash
# Todos os serviços
./scripts/start-all-services.sh  # Linux/Mac
.\scripts\start-all-services.ps1 # Windows

# Ou individualmente
cd services/monolith && npm run start:dev
cd services/orchestrator && npm run start:dev
cd services/business && npm run start:dev
```

### 2. Acessar Swagger

- **Monolith**: http://localhost:3010/api/docs
- **Orchestrator**: http://localhost:3009/api/docs
- **Business**: http://localhost:3011/api/docs

---

## 📝 Testes com cURL

### Autenticação

#### 1. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response:
# {
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": { "id": "...", "email": "user@example.com" }
# }
```

#### 2. Usar Token
```bash
# Salvar token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Usar em requisições
curl -X GET http://localhost:3010/api/users/profile/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## 👥 Testes de Usuários

### 1. Criar Usuário
```bash
curl -X POST http://localhost:3010/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha123",
    "phone": "11999999999"
  }'
```

### 2. Listar Usuários
```bash
curl -X GET "http://localhost:3010/api/users?skip=0&take=20"
```

### 3. Obter Usuário
```bash
curl -X GET http://localhost:3010/api/users/user-id-here
```

### 4. Atualizar Usuário
```bash
curl -X PATCH http://localhost:3010/api/users/user-id-here \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva Atualizado",
    "phone": "11988888888"
  }'
```

### 5. Deletar Usuário
```bash
curl -X DELETE http://localhost:3010/api/users/user-id-here
```

### 6. Upload Avatar
```bash
curl -X POST http://localhost:3010/api/users/user-id-here/avatar \
  -H "Content-Type: application/json" \
  -d '{
    "avatarUrl": "https://example.com/avatar.jpg"
  }'
```

### 7. Status Onboarding
```bash
curl -X GET http://localhost:3010/api/users/user-id-here/onboarding/status
```

### 8. Completar Onboarding
```bash
curl -X POST http://localhost:3010/api/users/user-id-here/onboarding/complete \
  -H "Content-Type: application/json" \
  -d '{
    "netIncome": 5000,
    "profession": "Desenvolvedor"
  }'
```

### 9. Estatísticas de Usuários (ADMIN)
```bash
curl -X GET http://localhost:3010/api/users/admin/stats
```

---

## 📦 Testes de Produtos

### 1. Listar Produtos
```bash
curl -X GET "http://localhost:3010/api/products?skip=0&take=20"
```

### 2. Buscar Produtos
```bash
curl -X GET "http://localhost:3010/api/products/search?q=eletrônico&skip=0&take=20"
```

### 3. Autocomplete
```bash
curl -X GET "http://localhost:3010/api/products/autocomplete?q=prod&limit=10"
```

### 4. Produtos por Marca
```bash
curl -X GET "http://localhost:3010/api/products/brand?name=Samsung&skip=0&take=20"
```

### 5. Produtos por Categoria
```bash
curl -X GET "http://localhost:3010/api/products/category?name=Eletrônicos&skip=0&take=20"
```

### 6. Top Produtos
```bash
curl -X GET "http://localhost:3010/api/products/top?limit=10"
```

---

## 🛒 Testes de Compras

### 1. Criar Compra
```bash
curl -X POST http://localhost:3010/api/users/user-id/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "merchant": "Supermercado XYZ",
    "description": "Compra de alimentos",
    "amount": 150.50,
    "paymentMethod": "pix",
    "purchasedAt": "2024-03-12T10:00:00Z"
  }'
```

### 2. Listar Compras
```bash
curl -X GET "http://localhost:3010/api/users/user-id/purchases?skip=0&take=20"
```

### 3. Resumo de Compras
```bash
curl -X GET http://localhost:3010/api/users/user-id/purchases/summary
```

### 4. Obter Compra
```bash
curl -X GET http://localhost:3010/api/users/user-id/purchases/purchase-id
```

### 5. Atualizar Compra
```bash
curl -X PUT http://localhost:3010/api/users/user-id/purchases/purchase-id \
  -H "Content-Type: application/json" \
  -d '{
    "merchant": "Supermercado ABC",
    "amount": 160.00
  }'
```

### 6. Deletar Compra
```bash
curl -X DELETE http://localhost:3010/api/users/user-id/purchases/purchase-id
```

---

## 🏢 Testes de Business Service via Orchestrator

### 1. Criar Estabelecimento
```bash
curl -X POST http://localhost:3009/api/business/establishments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Loja XYZ",
    "cnpj": "12.345.678/0001-90",
    "type": "Varejo",
    "ownerId": "user-id"
  }'
```

### 2. Listar Estabelecimentos
```bash
curl -X GET "http://localhost:3009/api/business/establishments?skip=0&take=20"
```

### 3. Criar Cliente
```bash
curl -X POST http://localhost:3009/api/business/customers \
  -H "Content-Type: application/json" \
  -d '{
    "establishmentId": "est-id",
    "name": "Cliente XYZ",
    "email": "cliente@example.com",
    "phone": "11999999999"
  }'
```

### 4. Criar Venda
```bash
curl -X POST http://localhost:3009/api/business/sales \
  -H "Content-Type: application/json" \
  -d '{
    "establishmentId": "est-id",
    "saleNumber": "001",
    "subtotal": 100.00,
    "total": 100.00,
    "paymentMethod": "pix",
    "sellerId": "user-id"
  }'
```

### 5. Criar Despesa
```bash
curl -X POST http://localhost:3009/api/business/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "establishmentId": "est-id",
    "category": "rent",
    "description": "Aluguel do mês",
    "amount": 2000.00,
    "paymentMethod": "pix",
    "expenseDate": "2024-03-12"
  }'
```

---

## 🔐 Testes de Autenticação

### 1. Testar JWT Guard
```bash
# Sem token - deve retornar 401
curl -X GET http://localhost:3010/api/users/profile/me

# Com token - deve retornar dados do usuário
curl -X GET http://localhost:3010/api/users/profile/me \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Testar Roles Guard
```bash
# Sem role ADMIN - deve retornar 403
curl -X GET http://localhost:3010/api/users/admin/stats \
  -H "Authorization: Bearer $TOKEN"

# Com role ADMIN - deve retornar estatísticas
curl -X GET http://localhost:3010/api/users/admin/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 📊 Testes com Postman

### 1. Importar Collection
- Abrir Postman
- File → Import
- Selecionar arquivo de collection (se disponível)

### 2. Configurar Variáveis
```
{{base_url}} = http://localhost:3010
{{token}} = seu-jwt-token-aqui
{{user_id}} = seu-user-id-aqui
```

### 3. Testar Rotas
- Usar as variáveis nas requisições
- Salvar responses para referência

---

## ✅ Checklist de Testes

### Autenticação
- [ ] Login funciona
- [ ] Token é retornado
- [ ] Token pode ser usado em requisições
- [ ] Token expirado retorna 401

### Usuários
- [ ] Criar usuário
- [ ] Listar usuários
- [ ] Obter usuário
- [ ] Atualizar usuário
- [ ] Deletar usuário
- [ ] Upload avatar
- [ ] Status onboarding
- [ ] Completar onboarding
- [ ] Estatísticas (ADMIN)

### Produtos
- [ ] Listar produtos
- [ ] Buscar produtos
- [ ] Autocomplete
- [ ] Por marca
- [ ] Por categoria
- [ ] Top produtos

### Compras
- [ ] Criar compra
- [ ] Listar compras
- [ ] Resumo compras
- [ ] Obter compra
- [ ] Atualizar compra
- [ ] Deletar compra

### Business Service
- [ ] Criar estabelecimento
- [ ] Listar estabelecimentos
- [ ] Criar cliente
- [ ] Criar venda
- [ ] Criar despesa
- [ ] Criar fornecedor
- [ ] Criar oferta

---

## 🐛 Troubleshooting

### Erro: "Cannot GET /api/users"
- Verificar se Monolith está rodando na porta 3010
- Verificar se o módulo Users está importado no app.module

### Erro: "401 Unauthorized"
- Verificar se token está sendo enviado
- Verificar se token não expirou
- Verificar se JWT_SECRET está correto

### Erro: "503 Service Unavailable"
- Verificar se Business Service está rodando na porta 3011
- Verificar se BUSINESS_SERVICE_URL está correto no .env

### Erro: "Cannot POST /api/business/establishments"
- Verificar se Orchestrator está rodando na porta 3009
- Verificar se BusinessModule está importado no app.module

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs dos serviços
2. Verificar variáveis de ambiente
3. Verificar se portas estão corretas
4. Verificar se bancos de dados estão rodando

