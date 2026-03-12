# Diferença entre User e Business User

## 📊 Comparação Rápida

| Aspecto | User (Consumidor) | Business User (Proprietário) |
|--------|------------------|------------------------------|
| **Objetivo** | Comprar produtos | Vender produtos/serviços |
| **Tabela Principal** | `users` | `users` + `establishments` |
| **Role** | USER | BUSINESS_OWNER, ADMIN |
| **Acesso** | App mobile/web | Dashboard de gestão |
| **Dados** | Pessoais | Pessoais + Comerciais |
| **Permissões** | Comprar, avaliar | Gerenciar loja, vendas, estoque |
| **Plano** | Somaai (FREE/PREMIUM) | Business (STARTER/PRO/ENTERPRISE) |

---

## 🧑 USER (Consumidor Final)

### Quem é?
Pessoa que **compra produtos** no app/web da Somaai.

### Dados Armazenados
```typescript
User {
  id: UUID
  email: string
  password: string (hash)
  firstName: string
  lastName: string
  cpf: string (opcional)
  phone: string
  avatar: string
  birthDate: Date
  
  // Plano Somaai
  planType: 'FREE' | 'PREMIUM'
  planExpiresAt: Date
  isOnTrial: boolean
  trialEndsAt: Date
  
  // Dados de compra
  scansUsed: number
  scansResetAt: Date
  
  // Integração
  mercadoPagoCustomerId: string
  
  // Status
  isActive: boolean
  hasCompletedOnboarding: boolean
  emailVerified: boolean
  lastLogin: Date
  
  createdAt: Date
  updatedAt: Date
}
```

### Relacionamentos
```
User
├─ 1:N UserAddress (múltiplos endereços)
├─ 1:N UserCard (múltiplos cartões)
├─ 1:N Purchase (histórico de compras)
├─ 1:N UserLog (logs de ações)
└─ 1:N ShoppingList (listas de compras)
```

### Rotas Disponíveis
```
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
GET    /auth/me
POST   /auth/verify-token

GET    /users/:id
PATCH  /users/:id
POST   /users/:id/avatar
GET    /users/:id/onboarding/status
POST   /users/:id/onboarding/complete

GET    /users/:userId/purchases
POST   /users/:userId/purchases
GET    /users/:userId/purchases/:purchaseId
PUT    /users/:userId/purchases/:purchaseId
DELETE /users/:userId/purchases/:purchaseId

GET    /users/:userId/shopping-lists
POST   /users/:userId/shopping-lists
GET    /users/:userId/shopping-lists/:id
PATCH  /users/:userId/shopping-lists/:id
DELETE /users/:userId/shopping-lists/:id

POST   /notifications/push-token
```

### Exemplo de Fluxo
```
1. Usuário se registra
   POST /auth/register
   
2. Faz login
   POST /auth/login → recebe JWT
   
3. Completa onboarding
   POST /users/:id/onboarding/complete
   
4. Cria lista de compras
   POST /users/:userId/shopping-lists
   
5. Registra uma compra
   POST /users/:userId/purchases
   
6. Consulta histórico
   GET /users/:userId/purchases
```

---

## 🏪 BUSINESS USER (Proprietário de Loja)

### Quem é?
Pessoa que **vende produtos/serviços** através da plataforma Somaai.

### Dados Armazenados

#### User (Base)
```typescript
User {
  id: UUID
  email: string
  password: string (hash)
  firstName: string
  lastName: string
  cpf: string
  phone: string
  avatar: string
  
  // Plano Business
  planType: 'BUSINESS_STARTER' | 'BUSINESS_PRO' | 'BUSINESS_ENTERPRISE'
  planExpiresAt: Date
  billingCycle: 'MONTHLY' | 'YEARLY'
  
  // Role
  role: 'BUSINESS_OWNER' | 'ADMIN'
  
  // Status
  isActive: boolean
  hasCompletedOnboarding: boolean
  
  createdAt: Date
  updatedAt: Date
}
```

#### Establishment (Loja)
```typescript
Establishment {
  id: UUID
  name: string
  cnpj: string (unique)
  type: string // 'SUPERMARKET', 'PHARMACY', 'RESTAURANT', etc
  phone: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  latitude: number
  longitude: number
  
  // Configurações
  businessHours: JSON // { "monday": "08:00-22:00", ... }
  logo: string
  description: string
  
  // Fiscal
  inscricaoEstadual: string
  inscricaoMunicipal: string
  regimeTributario: string
  cnae: string
  crt: string
  
  // Funcionalidades
  cashRegistersCount: number
  loyaltyEnabled: boolean
  loyaltyPointsPerReal: number
  autoIssueFiscalNote: boolean
  
  // Proprietário
  ownerId: UUID (FK para User)
  
  // Status
  isActive: boolean
  
  createdAt: Date
  updatedAt: Date
}
```

#### EstablishmentMember (Equipe)
```typescript
EstablishmentMember {
  id: UUID
  establishmentId: UUID
  userId: UUID
  role: 'OWNER' | 'MANAGER' | 'CASHIER' | 'DELIVERY'
  joinedAt: Date
  createdAt: Date
  updatedAt: Date
}
```

### Relacionamentos
```
User (BUSINESS_OWNER)
├─ 1:N Establishment (múltiplas lojas)
│  ├─ 1:N EstablishmentMember (equipe)
│  ├─ 1:N InventoryItem (produtos)
│  ├─ 1:N Sale (vendas)
│  ├─ 1:N Customer (clientes)
│  ├─ 1:N DeliveryOrder (pedidos)
│  ├─ 1:N FiscalNote (notas fiscais)
│  ├─ 1:N Expense (despesas)
│  ├─ 1:N Offer (promoções)
│  ├─ 1:N Supplier (fornecedores)
│  └─ 1:N DeliveryZone (zonas de entrega)
├─ 1:N UserLog (logs de ações)
└─ 1:N UserBusinessPlan (planos)
```

### Rotas Disponíveis

#### Autenticação (mesmas do User)
```
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
GET    /auth/me
POST   /auth/verify-token
```

#### Gerenciamento de Loja
```
POST   /establishments
GET    /establishments
GET    /establishments/:id
PUT    /establishments/:id
PATCH  /establishments/:id
DELETE /establishments/:id

POST   /establishments/:id/members
GET    /establishments/:id/members
PUT    /establishments/:id/members/:memberId
DELETE /establishments/:id/members/:memberId
```

#### Produtos/Inventário
```
POST   /establishments/:id/inventory
GET    /establishments/:id/inventory
GET    /establishments/:id/inventory/:itemId
PUT    /establishments/:id/inventory/:itemId
DELETE /establishments/:id/inventory/:itemId

POST   /establishments/:id/inventory/:itemId/stock-movement
GET    /establishments/:id/inventory/stock-movements
```

#### Vendas
```
POST   /establishments/:id/sales
GET    /establishments/:id/sales
GET    /establishments/:id/sales/:saleId
PUT    /establishments/:id/sales/:saleId
DELETE /establishments/:id/sales/:saleId

GET    /establishments/:id/sales/stats
GET    /establishments/:id/sales/daily-report
GET    /establishments/:id/sales/monthly-report
```

#### Clientes
```
GET    /establishments/:id/customers
GET    /establishments/:id/customers/:customerId
PUT    /establishments/:id/customers/:customerId
DELETE /establishments/:id/customers/:customerId
```

#### Entregas
```
POST   /establishments/:id/delivery-orders
GET    /establishments/:id/delivery-orders
GET    /establishments/:id/delivery-orders/:orderId
PATCH  /establishments/:id/delivery-orders/:orderId/status

POST   /establishments/:id/delivery-drivers
GET    /establishments/:id/delivery-drivers
PUT    /establishments/:id/delivery-drivers/:driverId

POST   /establishments/:id/delivery-zones
GET    /establishments/:id/delivery-zones
PUT    /establishments/:id/delivery-zones/:zoneId
```

#### Fiscal
```
GET    /establishments/:id/fiscal-notes
GET    /establishments/:id/fiscal-notes/:noteId
POST   /establishments/:id/fiscal-notes/:noteId/cancel

POST   /establishments/:id/fiscal-certificate
GET    /establishments/:id/fiscal-certificate
PUT    /establishments/:id/fiscal-certificate
```

#### Despesas
```
POST   /establishments/:id/expenses
GET    /establishments/:id/expenses
PUT    /establishments/:id/expenses/:expenseId
DELETE /establishments/:id/expenses/:expenseId
```

#### Promoções
```
POST   /establishments/:id/offers
GET    /establishments/:id/offers
PUT    /establishments/:id/offers/:offerId
DELETE /establishments/:id/offers/:offerId
```

#### Fornecedores
```
POST   /establishments/:id/suppliers
GET    /establishments/:id/suppliers
PUT    /establishments/:id/suppliers/:supplierId
DELETE /establishments/:id/suppliers/:supplierId

POST   /establishments/:id/purchase-orders
GET    /establishments/:id/purchase-orders
PUT    /establishments/:id/purchase-orders/:orderId
```

#### Relatórios
```
GET    /establishments/:id/reports/sales
GET    /establishments/:id/reports/inventory
GET    /establishments/:id/reports/customers
GET    /establishments/:id/reports/financial
```

### Exemplo de Fluxo
```
1. Proprietário se registra
   POST /auth/register (com role: BUSINESS_OWNER)
   
2. Faz login
   POST /auth/login → recebe JWT
   
3. Cria sua loja
   POST /establishments
   
4. Adiciona membros da equipe
   POST /establishments/:id/members
   
5. Cadastra produtos
   POST /establishments/:id/inventory
   
6. Registra uma venda
   POST /establishments/:id/sales
   
7. Consulta relatórios
   GET /establishments/:id/reports/sales
```

---

## 🔄 Diferenças Principais

### 1. Autenticação
```
User (Consumidor)
├─ Role: USER
├─ Plano: FREE/PREMIUM
└─ Acesso: App mobile/web

Business User (Proprietário)
├─ Role: BUSINESS_OWNER/ADMIN
├─ Plano: BUSINESS_STARTER/PRO/ENTERPRISE
└─ Acesso: Dashboard de gestão
```

### 2. Dados
```
User (Consumidor)
├─ Pessoais (nome, email, CPF)
├─ Endereços de entrega
├─ Cartões de crédito
└─ Histórico de compras

Business User (Proprietário)
├─ Pessoais (nome, email, CPF)
├─ Dados da loja (CNPJ, IE, etc)
├─ Configurações fiscais
├─ Equipe
├─ Produtos
├─ Clientes
├─ Vendas
├─ Entregas
└─ Relatórios
```

### 3. Permissões
```
User (Consumidor)
├─ Comprar produtos
├─ Criar listas de compras
├─ Avaliar produtos
└─ Ver histórico de compras

Business User (Proprietário)
├─ Gerenciar loja
├─ Gerenciar produtos
├─ Gerenciar vendas
├─ Gerenciar clientes
├─ Gerenciar entregas
├─ Emitir notas fiscais
├─ Gerar relatórios
└─ Gerenciar equipe
```

### 4. Banco de Dados
```
User (Consumidor)
├─ users
├─ user_addresses
├─ user_cards
├─ purchases
├─ purchase_items
└─ shopping_lists

Business User (Proprietário)
├─ users
├─ establishments
├─ establishment_members
├─ inventory_items
├─ sales
├─ sale_items
├─ customers
├─ delivery_orders
├─ delivery_drivers
├─ delivery_zones
├─ fiscal_notes
├─ expenses
├─ offers
├─ suppliers
├─ purchase_orders
└─ (+ muitas outras)
```

---

## 🎯 Implementação

### Consolidação na Tabela User

```sql
ALTER TABLE users ADD COLUMN role ENUM('USER', 'BUSINESS_OWNER', 'ADMIN') DEFAULT 'USER';
ALTER TABLE users ADD COLUMN planType VARCHAR(50);
ALTER TABLE users ADD COLUMN billingCycle VARCHAR(20);
ALTER TABLE users ADD COLUMN planExpiresAt DATETIME;
```

### Middleware de Autorização

```typescript
// Para User (Consumidor)
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('USER')
async buyProduct() { ... }

// Para Business User (Proprietário)
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('BUSINESS_OWNER', 'ADMIN')
async createSale() { ... }
```

### Exemplo de Rota Protegida

```typescript
// Apenas consumidores podem comprar
@Post('/users/:userId/purchases')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('USER')
async createPurchase(@Param('userId') userId: string) { ... }

// Apenas proprietários podem vender
@Post('/establishments/:id/sales')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('BUSINESS_OWNER', 'ADMIN')
async createSale(@Param('id') establishmentId: string) { ... }
```

---

## 📋 Resumo

| Aspecto | User | Business User |
|--------|------|---------------|
| **Tabelas** | 5 | 15+ |
| **Rotas** | ~30 | ~80+ |
| **Permissões** | Comprar | Vender |
| **Plano** | Somaai | Business |
| **Complexidade** | Baixa | Alta |
| **Dados** | Pessoais | Pessoais + Comerciais |

---

## 🚀 Próximos Passos

1. ✅ Entender a diferença (feito!)
2. ⏳ Implementar role-based access control (RBAC)
3. ⏳ Criar rotas separadas para cada tipo
4. ⏳ Implementar validações específicas
5. ⏳ Testar fluxos completos

