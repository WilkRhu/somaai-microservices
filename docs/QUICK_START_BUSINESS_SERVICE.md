# Business Service - Quick Start Guide 🚀

## ⚡ 30 Segundos para Começar

### 1. Instalar e Iniciar
```bash
# Todos os serviços
./scripts/start-all-services.sh  # Linux/Mac
.\scripts\start-all-services.ps1 # Windows

# Ou apenas Business Service
cd services/business && npm install && npm run start:dev
```

### 2. Acessar
- **API**: http://localhost:3011
- **Docs**: http://localhost:3011/api/docs
- **Via Orchestrator**: http://localhost:3009/api/business

---

## 📚 Módulos Disponíveis

| Módulo | Endpoint | Descrição |
|--------|----------|-----------|
| Establishments | `/establishments` | Gerenciar lojas/restaurantes |
| Customers | `/customers` | Gerenciar clientes |
| Inventory | `/inventory` | Gerenciar produtos e estoque |
| Sales | `/sales` | Gerenciar vendas |
| Expenses | `/expenses` | Gerenciar despesas |
| Suppliers | `/suppliers` | Gerenciar fornecedores |
| Offers | `/offers` | Gerenciar ofertas |

---

## 🔥 Exemplos de Uso

### Criar Estabelecimento
```bash
curl -X POST http://localhost:3011/establishments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Loja XYZ",
    "cnpj": "12.345.678/0001-90",
    "type": "Varejo",
    "ownerId": "uuid-do-usuario"
  }'
```

### Listar Estabelecimentos
```bash
curl http://localhost:3011/establishments
```

### Criar Venda
```bash
curl -X POST http://localhost:3011/sales \
  -H "Content-Type: application/json" \
  -d '{
    "establishmentId": "uuid",
    "saleNumber": "001",
    "subtotal": 100.00,
    "total": 100.00,
    "paymentMethod": "pix",
    "sellerId": "uuid"
  }'
```

### Registrar Despesa
```bash
curl -X POST http://localhost:3011/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "establishmentId": "uuid",
    "category": "rent",
    "description": "Aluguel do mês",
    "amount": 2000.00,
    "paymentMethod": "pix",
    "expenseDate": "2024-03-12"
  }'
```

---

## 🗂️ Estrutura de Pastas

```
services/business/
├── src/
│   ├── establishments/    ← Gerenciar lojas
│   ├── customers/         ← Gerenciar clientes
│   ├── inventory/         ← Gerenciar estoque
│   ├── sales/             ← Gerenciar vendas
│   ├── expenses/          ← Gerenciar despesas
│   ├── suppliers/         ← Gerenciar fornecedores
│   ├── offers/            ← Gerenciar ofertas
│   ├── shared/            ← Enums compartilhados
│   ├── app.module.ts      ← Configuração principal
│   └── main.ts            ← Entrada da aplicação
├── package.json
└── tsconfig.json
```

---

## 🔑 Enums Disponíveis

### PaymentMethod
```typescript
'cash' | 'card' | 'pix' | 'boleto'
```

### SaleStatus
```typescript
'completed' | 'cancelled' | 'pending'
```

### ExpenseCategory
```typescript
'inventory_purchase' | 'rent' | 'utilities' | 'salaries' | 'taxes' | ...
```

### StockMovementType
```typescript
'entry' | 'sale' | 'adjustment' | 'loss' | 'return'
```

---

## 📊 Banco de Dados

**Database**: `somaai_business`

Tabelas criadas automaticamente:
- `business_establishments`
- `establishment_members`
- `business_customers`
- `inventory_items`
- `stock_movements`
- `sales`
- `sale_items`
- `business_expenses`
- `suppliers`
- `purchase_orders`
- `offers`
- `offer_notifications`

---

## 🔗 Integração com Orchestrator

O Orchestrator roteia requisições para o Business Service:

```
Frontend → Orchestrator (3009) → Business Service (3011)
           /api/business/*
```

---

## 📝 Variáveis de Ambiente

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=somaai_business

# Service
APP_PORT=3011
CORS_ORIGIN=*
```

---

## ✅ Checklist de Verificação

- ✅ Todos os 7 módulos criados
- ✅ Todas as 15 entidades criadas
- ✅ Todos os 10 enums criados
- ✅ Todos os controllers com CRUD
- ✅ Todos os services implementados
- ✅ TypeORM configurado
- ✅ Startup scripts atualizados
- ✅ Sem erros de compilação

---

## 🆘 Troubleshooting

### Erro: "Cannot find module"
```bash
cd services/business
npm install
```

### Erro: "Port 3011 already in use"
```bash
# Mude a porta em .env
APP_PORT=3012
```

### Erro: "Database connection failed"
```bash
# Verifique as credenciais em .env
# Certifique-se que MySQL está rodando
```

---

## 📚 Documentação Completa

- `docs/BUSINESS_SERVICE_COMPLETE.md` - Documentação detalhada
- `docs/ALL_ENTITIES_DOCUMENTATION.md` - Todas as entidades
- `docs/SYSTEM_ENUMS_DOCUMENTATION.md` - Todos os enums
- `docs/BACKEND_ROUTES.md` - Todas as rotas

---

## 🎯 Próximos Passos

1. Integrar com Orchestrator
2. Adicionar autenticação JWT
3. Implementar validação com DTOs
4. Publicar eventos Kafka
5. Adicionar testes

---

**Status**: ✅ PRONTO PARA USO

