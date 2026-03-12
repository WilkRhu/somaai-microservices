# Testing Business Service 🧪

## Quick Start

### Option 1: Swagger UI (Recomendado)
Abra no navegador:
```
http://localhost:3011/api/docs
```

Todos os endpoints estão documentados e você pode testar diretamente no Swagger.

---

### Option 2: Postman
1. Importe o arquivo `postman-business-service.json` no Postman
2. Configure as variáveis (establishment_id, customer_id, etc.)
3. Execute os testes

---

### Option 3: cURL (Terminal)

## Teste Completo - Fluxo de Negócio

### 1️⃣ Criar um Estabelecimento

```bash
curl -X POST http://localhost:3011/api/establishments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Loja Principal",
    "cnpj": "12345678000190",
    "ownerId": "user-123",
    "address": "Rua Principal, 100",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01310-100",
    "phone": "1133334444",
    "email": "loja@example.com"
  }'
```

**Resposta esperada:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Loja Principal",
  "cnpj": "12345678000190",
  "ownerId": "user-123",
  "createdAt": "2026-03-12T15:50:00.000Z",
  "updatedAt": "2026-03-12T15:50:00.000Z"
}
```

**Salve o `id` como `ESTABLISHMENT_ID`**

---

### 2️⃣ Listar Estabelecimentos

```bash
curl http://localhost:3011/api/establishments
```

---

### 3️⃣ Criar um Cliente

```bash
curl -X POST http://localhost:3011/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "establishmentId": "ESTABLISHMENT_ID",
    "name": "João Silva",
    "cpf": "12345678900",
    "email": "joao@example.com",
    "phone": "11999999999",
    "address": "Rua A, 123",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01310-100"
  }'
```

**Salve o `id` como `CUSTOMER_ID`**

---

### 4️⃣ Criar um Item de Inventário

```bash
curl -X POST http://localhost:3011/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "establishmentId": "ESTABLISHMENT_ID",
    "barcode": "7891234567890",
    "name": "Produto A",
    "category": "Eletrônicos",
    "brand": "Brand X",
    "costPrice": 50.00,
    "salePrice": 99.90,
    "quantity": 100,
    "minQuantity": 10,
    "unit": "UN",
    "description": "Descrição do produto"
  }'
```

**Salve o `id` como `ITEM_ID`**

---

### 5️⃣ Listar Itens de Inventário

```bash
curl "http://localhost:3011/inventory?establishmentId=ESTABLISHMENT_ID"
```

---

### 6️⃣ Criar uma Venda

```bash
curl -X POST http://localhost:3011/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "establishmentId": "ESTABLISHMENT_ID",
    "customerId": "CUSTOMER_ID",
    "totalAmount": 299.70,
    "status": "COMPLETED",
    "paymentMethod": "CREDIT_CARD",
    "notes": "Venda realizada com sucesso"
  }'
```

**Salve o `id` como `SALE_ID`**

---

### 7️⃣ Adicionar Item à Venda

```bash
curl -X POST http://localhost:3011/api/sales/SALE_ID/items \
  -H "Content-Type: application/json" \
  -d '{
    "inventoryItemId": "ITEM_ID",
    "quantity": 3,
    "unitPrice": 99.90,
    "totalPrice": 299.70
  }'
```

---

### 8️⃣ Criar uma Despesa

```bash
curl -X POST http://localhost:3011/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "establishmentId": "ESTABLISHMENT_ID",
    "category": "UTILITIES",
    "description": "Conta de luz",
    "amount": 500.00,
    "paymentMethod": "BANK_TRANSFER",
    "status": "PENDING",
    "expenseDate": "2026-03-12",
    "dueDate": "2026-03-20"
  }'
```

---

### 9️⃣ Criar um Fornecedor

```bash
curl -X POST http://localhost:3011/api/suppliers \
  -H "Content-Type: application/json" \
  -d '{
    "establishmentId": "ESTABLISHMENT_ID",
    "name": "Fornecedor ABC",
    "cnpj": "98765432000100",
    "email": "contato@fornecedor.com",
    "phone": "1133334444",
    "address": "Rua B, 456",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01310-100"
  }'
```

**Salve o `id` como `SUPPLIER_ID`**

---

### 🔟 Criar um Pedido de Compra

```bash
curl -X POST http://localhost:3011/api/suppliers/purchase-orders \
  -H "Content-Type: application/json" \
  -d '{
    "establishmentId": "ESTABLISHMENT_ID",
    "supplierId": "SUPPLIER_ID",
    "orderNumber": "PO-001",
    "status": "PENDING",
    "totalAmount": 5000.00,
    "expectedDeliveryDate": "2026-03-20"
  }'
```

---

### 1️⃣1️⃣ Criar uma Oferta

```bash
curl -X POST http://localhost:3011/api/offers \
  -H "Content-Type: application/json" \
  -d '{
    "establishmentId": "ESTABLISHMENT_ID",
    "inventoryItemId": "ITEM_ID",
    "name": "Promoção Especial",
    "description": "Desconto de 20% em produtos selecionados",
    "discountType": "PERCENTAGE",
    "discountValue": 20,
    "startDate": "2026-03-12T00:00:00Z",
    "endDate": "2026-03-31T23:59:59Z",
    "isActive": true
  }'
```

---

## Endpoints Disponíveis

### Establishments
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/establishments` | Criar estabelecimento |
| GET | `/api/establishments` | Listar estabelecimentos |
| GET | `/api/establishments/:id` | Obter estabelecimento |
| PUT | `/api/establishments/:id` | Atualizar estabelecimento |
| DELETE | `/api/establishments/:id` | Deletar estabelecimento |

### Customers
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/customers` | Criar cliente |
| GET | `/api/customers` | Listar clientes |
| GET | `/api/customers/:id` | Obter cliente |
| PUT | `/api/customers/:id` | Atualizar cliente |
| DELETE | `/api/customers/:id` | Deletar cliente |

### Inventory
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/inventory` | Criar item |
| GET | `/inventory` | Listar itens |
| GET | `/inventory/:id` | Obter item |
| PUT | `/inventory/:id` | Atualizar item |
| DELETE | `/inventory/:id` | Deletar item |
| POST | `/inventory/movements` | Criar movimentação |
| GET | `/inventory/:itemId/movements` | Listar movimentações |

### Sales
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/sales` | Criar venda |
| GET | `/api/sales` | Listar vendas |
| GET | `/api/sales/:id` | Obter venda |
| PUT | `/api/sales/:id` | Atualizar venda |
| DELETE | `/api/sales/:id` | Deletar venda |
| POST | `/api/sales/:saleId/items` | Adicionar item |
| DELETE | `/api/sales/items/:itemId` | Remover item |

### Expenses
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/expenses` | Criar despesa |
| GET | `/api/expenses` | Listar despesas |
| GET | `/api/expenses/:id` | Obter despesa |
| PATCH | `/api/expenses/:id` | Atualizar despesa |
| DELETE | `/api/expenses/:id` | Deletar despesa |

### Suppliers
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/suppliers` | Criar fornecedor |
| GET | `/api/suppliers` | Listar fornecedores |
| GET | `/api/suppliers/:id` | Obter fornecedor |
| PATCH | `/api/suppliers/:id` | Atualizar fornecedor |
| DELETE | `/api/suppliers/:id` | Deletar fornecedor |
| POST | `/api/suppliers/purchase-orders` | Criar pedido |
| GET | `/api/suppliers/purchase-orders` | Listar pedidos |
| GET | `/api/suppliers/purchase-orders/:id` | Obter pedido |
| PATCH | `/api/suppliers/purchase-orders/:id` | Atualizar pedido |
| DELETE | `/api/suppliers/purchase-orders/:id` | Deletar pedido |

### Offers
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/offers` | Criar oferta |
| GET | `/api/offers` | Listar ofertas |
| GET | `/api/offers/:id` | Obter oferta |
| PATCH | `/api/offers/:id` | Atualizar oferta |
| DELETE | `/api/offers/:id` | Deletar oferta |
| POST | `/api/offers/notifications` | Criar notificação |
| GET | `/api/offers/notifications/:offerId` | Listar notificações |
| PATCH | `/api/offers/notifications/:notificationId/view` | Marcar como visualizada |

---

## Variáveis para Substituir

Ao executar os comandos, substitua:
- `ESTABLISHMENT_ID` - ID do estabelecimento criado
- `CUSTOMER_ID` - ID do cliente criado
- `ITEM_ID` - ID do item de inventário criado
- `SALE_ID` - ID da venda criada
- `SUPPLIER_ID` - ID do fornecedor criado

---

## Dicas

### 1. Usar jq para formatar JSON
```bash
curl http://localhost:3011/api/establishments | jq .
```

### 2. Salvar resposta em variável
```bash
RESPONSE=$(curl -s -X POST http://localhost:3011/api/establishments \
  -H "Content-Type: application/json" \
  -d '{"name":"Loja","cnpj":"12345678000190","ownerId":"user-123"}')

ESTABLISHMENT_ID=$(echo $RESPONSE | jq -r '.id')
echo $ESTABLISHMENT_ID
```

### 3. Testar com autenticação (quando implementado)
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3011/api/establishments
```

---

## Troubleshooting

### Erro: "Connection refused"
- Verifique se o Business Service está rodando: `npm run start:dev`
- Verifique a porta: deve ser 3011

### Erro: "Unknown database"
- Execute: `node scripts/create-business-tables.js`

### Erro: "Duplicate key"
- Execute: `node scripts/clean-business-db.js`
- Depois: `node scripts/create-business-tables.js`

### Erro: "CORS error"
- CORS ainda não está configurado
- Use Postman ou cURL em vez de navegador

---

## Próximos Passos

1. ✅ Testar endpoints
2. 🔄 Integrar com Orchestrator
3. 🔄 Adicionar autenticação JWT
4. 🔄 Implementar testes automatizados
5. 🔄 Deploy em produção

---

## Suporte

Para mais informações:
- Swagger: http://localhost:3011/api/docs
- Postman Collection: `postman-business-service.json`
- Documentação: `BUSINESS_SERVICE_RUNNING.md`
