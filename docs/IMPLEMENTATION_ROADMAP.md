# Roadmap de Implementação - Entidades + Rotas

## 🎯 Estratégia Geral

Implementar em **3 sprints de 1 semana cada**, focando em:
1. **Entidades** (Banco de dados)
2. **Rotas** (Controllers)
3. **Serviços** (Lógica de negócio)

---

## 📅 SPRINT 1 - MVP (Semana 1)

### Objetivo
Ter um sistema funcional com autenticação, usuários, produtos e compras básicas.

### Entidades a Criar (7)
```
✅ User (consolidado)
✅ UserAddress
✅ UserCard
✅ InventoryItem (Produtos)
✅ Purchase
✅ PurchaseItem
✅ FiscalNote
```

### Rotas a Implementar (25)

#### 1. Autenticação (5 rotas) - Auth Service
```
✅ POST /auth/register
✅ POST /auth/login
✅ POST /auth/refresh
✅ GET /auth/me
✅ POST /auth/verify-token
```
**Status**: ✅ Já implementado

---

#### 2. Usuários (13 rotas) - Monolith Service
```
❌ POST /users - Criar usuário
❌ GET /users - Listar usuários (ADMIN)
❌ GET /users/:id - Obter usuário
❌ PUT /users/:id - Atualizar usuário (PUT)
❌ PATCH /users/:id - Atualizar usuário (PATCH)
❌ DELETE /users/:id - Deletar usuário
❌ POST /users/:id/avatar - Upload avatar
❌ GET /users/:id/onboarding/status - Status onboarding
❌ POST /users/:id/onboarding/complete - Completar onboarding
❌ GET /users/admin/stats - Stats (ADMIN)
❌ GET /admin/users - Listar (ADMIN)
❌ GET /admin/users/:id - Obter (ADMIN)
❌ PUT /admin/users/:id/role - Alterar role (ADMIN)
```

---

#### 3. Produtos (6 rotas) - Monolith Service
```
❌ GET /products - Listar produtos
❌ GET /products/search - Buscar produtos
❌ GET /products/autocomplete - Autocomplete
❌ GET /products/brand - Por marca
❌ GET /products/category - Por categoria
❌ GET /products/top - Top produtos
```

---

#### 4. Compras (12 rotas) - Monolith Service
```
❌ POST /users/:userId/purchases - Registrar compra
❌ GET /users/:userId/purchases - Listar compras
❌ GET /users/:userId/purchases/summary - Resumo
❌ GET /users/:userId/purchases/trends - Tendências
❌ GET /users/:userId/purchases/balance - Balanço
❌ GET /users/:userId/purchases/stats - Estatísticas
❌ GET /users/:userId/purchases/type-stats - Stats por tipo
❌ GET /users/:userId/purchases/payment-method-stats - Stats por método
❌ GET /users/:userId/purchases/future-expenses - Gastos futuros
❌ GET /users/:userId/purchases/:purchaseId - Obter compra
❌ PUT /users/:userId/purchases/:purchaseId - Atualizar compra
❌ DELETE /users/:userId/purchases/:purchaseId - Deletar compra
```

---

### Arquitetura de Serviços

```
┌─────────────────────────────────────────────────────────┐
│                    SPRINT 1 - MVP                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Auth Service (Port 3000)                              │
│  ├─ POST /auth/register ✅                             │
│  ├─ POST /auth/login ✅                                │
│  ├─ POST /auth/refresh ✅                              │
│  ├─ GET /auth/me ✅                                    │
│  └─ POST /auth/verify-token ✅                         │
│                                                         │
│  Monolith Service (Port 3010)                          │
│  ├─ Users Module (13 rotas)                            │
│  ├─ Products Module (6 rotas)                          │
│  └─ Purchases Module (12 rotas)                        │
│                                                         │
│  Orchestrator Service (Port 3009)                      │
│  └─ Orders Module (2 rotas)                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Banco de Dados - Sprint 1

```sql
-- Consolidações
ALTER TABLE users ADD COLUMN planType VARCHAR(50);
ALTER TABLE users ADD COLUMN planExpiresAt DATETIME;
ALTER TABLE users ADD COLUMN billingCycle VARCHAR(20);

-- Novas tabelas
CREATE TABLE user_addresses (...)
CREATE TABLE user_cards (...)
CREATE TABLE inventory_items (...)
CREATE TABLE purchases (...)
CREATE TABLE purchase_items (...)
CREATE TABLE fiscal_notes (...)
```

### Tarefas Específicas

#### Semana 1 - Dia 1-2: Banco de Dados
- [ ] Atualizar `scripts/init-databases.sql` com consolidações
- [ ] Adicionar campos de plano ao User
- [ ] Criar tabelas de endereço e cartão
- [ ] Criar tabelas de produtos e compras

#### Semana 1 - Dia 3-4: Entidades TypeORM
- [ ] Criar `User.entity.ts` (consolidado)
- [ ] Criar `UserAddress.entity.ts`
- [ ] Criar `UserCard.entity.ts`
- [ ] Criar `InventoryItem.entity.ts`
- [ ] Criar `Purchase.entity.ts`
- [ ] Criar `PurchaseItem.entity.ts`
- [ ] Criar `FiscalNote.entity.ts`

#### Semana 1 - Dia 5: Controllers + Services
- [ ] Implementar `UsersController` (13 rotas)
- [ ] Implementar `UsersService`
- [ ] Implementar `ProductsController` (6 rotas)
- [ ] Implementar `ProductsService`
- [ ] Implementar `PurchasesController` (12 rotas)
- [ ] Implementar `PurchasesService`

#### Semana 1 - Dia 6-7: Testes
- [ ] Testar todas as rotas
- [ ] Testar autenticação
- [ ] Testar validações
- [ ] Documentar no Swagger

---

## 📅 SPRINT 2 - Pagamentos + Delivery (Semana 2)

### Objetivo
Adicionar pagamentos, entregas e notificações.

### Entidades a Criar (12)
```
✅ Establishment
✅ EstablishmentMember
✅ EstablishmentMercadoPagoIntegration
✅ Customer
✅ DeliveryOrder
✅ DeliveryDriver
✅ DeliveryZone
✅ StockMovement
✅ PaymentTerminalConfig
✅ NotificationCampaign
✅ NotificationDelivery
✅ UserPushToken
```

### Rotas a Implementar (20)

#### 1. Pagamentos (5 rotas) - Payments Service
```
❌ POST /payments/pix/generate
❌ GET /payments/pix/:paymentId/status
❌ GET /payments/installments
❌ POST /payments/tokenize-card
❌ POST /payments/credit-card/process
```

#### 2. Assinaturas (11 rotas) - Subscriptions Service
```
❌ GET /subscriptions/test-config
❌ GET /subscriptions/plans
❌ GET /subscriptions/status/:userId
❌ POST /subscriptions/activate-trial/:userId
❌ POST /subscriptions/create/:userId
❌ POST /subscriptions/webhook
❌ GET /subscriptions/webhook-url
❌ POST /subscriptions/webhook/test
❌ GET /subscriptions/payment-status/:userId
❌ POST /subscriptions/check-payment/:userId
❌ GET /subscriptions/payment/success
```

#### 3. Entregas (4 rotas) - Delivery Service
```
❌ POST /delivery/orders
❌ GET /delivery/orders/:id
❌ PATCH /delivery/orders/:id/status
❌ GET /delivery/orders/tracking/:id
```

#### 4. Notificações (1 rota) - Notifications Service
```
❌ POST /notifications/push-token
```

---

## 📅 SPRINT 3 - Complementares (Semana 3)

### Objetivo
Adicionar OCR, Scanner, Tickets, Relatórios e Logs.

### Entidades a Criar (24)
```
✅ Expense
✅ Offer
✅ OfferNotification
✅ Supplier
✅ PurchaseOrder
✅ UserLog
✅ Report
✅ Ticket
✅ TicketMessage
✅ Brand
✅ PurchaseInstallment
✅ ProductPriceHistory
✅ FiscalCorrection
✅ FiscalNumberDisablement
✅ FiscalContingencyNote
✅ FiscalAuditLog
✅ DeliveryTracking
✅ StoreLocation
✅ PriceAverage
✅ PriceReport
✅ ShoppingList
✅ ShoppingListItem
✅ Offer
✅ OfferNotification
```

### Rotas a Implementar (30+)

#### 1. OCR (6 rotas) - OCR Service
```
❌ POST /ocr/extract-base64
❌ POST /ocr/extract-receipt-base64
❌ POST /ocr/receipt-from-url
❌ GET /ocr/queue-status
❌ GET /ocr/scan-limit
❌ POST /ocr/queue-clear
```

#### 2. Scanner (4 rotas) - Scanner Service
```
❌ POST /scanner/receive
❌ GET /scanner/product
❌ GET /scanner/last
❌ GET /scanner/debug/barcodes
```

#### 3. Tickets (4 rotas) - Tickets Service
```
❌ GET /user/tickets
❌ GET /user/tickets/:ticketId
❌ POST /user/tickets
❌ POST /user/tickets/:ticketId/messages
```

#### 4. Relatórios (3 rotas) - Reports Service
```
❌ POST /admin/reports/generate
❌ GET /admin/reports/data
❌ GET /admin/reports/recent
```

#### 5. Logs (3 rotas) - Logs Service
```
❌ GET /logs/my-logs
❌ GET /logs/user/:userId
❌ GET /logs
```

#### 6. Email (3 rotas) - Email Service
```
❌ GET /email/verify
❌ POST /email/test
❌ POST /email/custom
```

#### 7. Preços (6 rotas) - Prices Service
```
❌ POST /prices/report
❌ POST /prices/report-offer
❌ GET /prices/search
❌ GET /prices/suggest
❌ GET /prices/nearby
❌ GET /prices/offers
```

#### 8. Listas de Compras (5 rotas) - Shopping Lists Service
```
❌ POST /users/:userId/shopping-lists
❌ GET /users/:userId/shopping-lists
❌ GET /users/:userId/shopping-lists/:id
❌ PATCH /users/:userId/shopping-lists/:id
❌ DELETE /users/:userId/shopping-lists/:id
```

---

## 🛠️ Estrutura de Implementação

### Por Sprint

```
SPRINT 1 (MVP)
├─ Banco de Dados
│  ├─ Consolidar User
│  ├─ Criar UserAddress
│  ├─ Criar UserCard
│  ├─ Criar InventoryItem
│  ├─ Criar Purchase
│  ├─ Criar PurchaseItem
│  └─ Criar FiscalNote
├─ Entidades TypeORM (7)
├─ Controllers (3)
├─ Services (3)
└─ Rotas (25)

SPRINT 2 (Pagamentos + Delivery)
├─ Banco de Dados (12 tabelas)
├─ Entidades TypeORM (12)
├─ Controllers (4)
├─ Services (4)
└─ Rotas (20)

SPRINT 3 (Complementares)
├─ Banco de Dados (24 tabelas)
├─ Entidades TypeORM (24)
├─ Controllers (8)
├─ Services (8)
└─ Rotas (30+)
```

---

## 📊 Resumo de Implementação

| Sprint | Entidades | Rotas | Controllers | Services | Dias |
|--------|-----------|-------|-------------|----------|------|
| 1 (MVP) | 7 | 25 | 3 | 3 | 7 |
| 2 | 12 | 20 | 4 | 4 | 7 |
| 3 | 24 | 30+ | 8 | 8 | 7 |
| **Total** | **43** | **75+** | **15** | **15** | **21** |

---

## 🚀 Próximos Passos Imediatos

### Hoje (Agora)
1. [ ] Decidir se segue este roadmap
2. [ ] Confirmar prioridades
3. [ ] Alocar recursos

### Amanhã (Sprint 1 - Dia 1)
1. [ ] Atualizar `scripts/init-databases.sql`
2. [ ] Criar entidades TypeORM
3. [ ] Implementar Controllers
4. [ ] Implementar Services

### Próxima Semana (Sprint 1 - Dia 5+)
1. [ ] Testar todas as rotas
2. [ ] Documentar no Swagger
3. [ ] Fazer code review
4. [ ] Começar Sprint 2

---

## 💡 Recomendações

### 1. Prioridade
- **Sprint 1**: Crítico - Sem isso, nada funciona
- **Sprint 2**: Importante - Adiciona valor real
- **Sprint 3**: Complementar - Nice-to-have

### 2. Equipe
- **Sprint 1**: 1-2 devs (7 dias)
- **Sprint 2**: 2-3 devs (7 dias)
- **Sprint 3**: 3-4 devs (7 dias)

### 3. Testes
- Implementar testes unitários para cada serviço
- Implementar testes de integração para cada rota
- Usar Postman/Insomnia para testar APIs

### 4. Documentação
- Manter Swagger atualizado
- Documentar cada rota
- Documentar cada entidade

### 5. Banco de Dados
- Executar migrations em ordem
- Fazer backup antes de cada sprint
- Testar em ambiente de desenvolvimento

---

## 📝 Checklist de Implementação

### Sprint 1
- [ ] Banco de dados atualizado
- [ ] 7 entidades criadas
- [ ] 3 controllers implementados
- [ ] 3 services implementados
- [ ] 25 rotas funcionando
- [ ] Swagger documentado
- [ ] Testes passando
- [ ] Code review aprovado

### Sprint 2
- [ ] Banco de dados atualizado
- [ ] 12 entidades criadas
- [ ] 4 controllers implementados
- [ ] 4 services implementados
- [ ] 20 rotas funcionando
- [ ] Swagger documentado
- [ ] Testes passando
- [ ] Code review aprovado

### Sprint 3
- [ ] Banco de dados atualizado
- [ ] 24 entidades criadas
- [ ] 8 controllers implementados
- [ ] 8 services implementados
- [ ] 30+ rotas funcionando
- [ ] Swagger documentado
- [ ] Testes passando
- [ ] Code review aprovado

---

## 🎯 Resultado Final

Após 3 sprints (21 dias):
- ✅ 43 entidades implementadas
- ✅ 75+ rotas funcionando
- ✅ Sistema completo e funcional
- ✅ Pronto para produção
- ✅ Documentação completa
- ✅ Testes automatizados

