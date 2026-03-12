# Documentação Completa de Enums do Sistema

## 📋 Índice

1. [SHARED Enums](#shared-enums)
2. [BUSINESS Enums](#business-enums)
3. [DELIVERY Enums](#delivery-enums)
4. [FISCAL Enums](#fiscal-enums)
5. [TICKETS Enums](#tickets-enums)
6. [PURCHASES Enums](#purchases-enums)
7. [REPORTS Enums](#reports-enums)
8. [OFFERS Enums](#offers-enums)
9. [LOGS Enums](#logs-enums)

---

## SHARED Enums

### UserRole
**Arquivo**: `src/shared/enums/user-role.enum.ts`

**Descrição**: Define os papéis de usuário no sistema

```typescript
export enum UserRole {
  USER = 'user',              // Usuário comum
  SUPPORT = 'support',        // Suporte técnico
  ADMIN = 'admin',            // Administrador
  SUPER_ADMIN = 'super_admin' // Super Administrador
}
```

| Valor | Descrição |
|-------|-----------|
| `user` | Usuário comum |
| `support` | Suporte técnico |
| `admin` | Administrador |
| `super_admin` | Super Administrador |

---

### PaymentMethod
**Arquivo**: `src/shared/enums/payment-method.enum.ts`

**Descrição**: Métodos de pagamento disponíveis

```typescript
export enum PaymentMethod {
  PIX = 'pix',                          // PIX
  CREDIT_CARD = 'credit_card',          // Cartão de Crédito
  DEBIT_CARD = 'debit_card',            // Cartão de Débito
  CASH = 'cash',                        // Dinheiro
  BANK_SLIP = 'bank_slip',              // Boleto
  BANK_TRANSFER = 'bank_transfer',      // Transferência Bancária
  VOUCHER = 'voucher',                  // Vale/Cupom
  OTHER = 'other'                       // Outros
}
```

| Valor | Descrição |
|-------|-----------|
| `pix` | PIX |
| `credit_card` | Cartão de Crédito |
| `debit_card` | Cartão de Débito |
| `cash` | Dinheiro |
| `bank_slip` | Boleto |
| `bank_transfer` | Transferência Bancária |
| `voucher` | Vale/Cupom |
| `other` | Outros |

---

### AuthProvider
**Arquivo**: `src/shared/enums/auth-provider.enum.ts`

**Descrição**: Provedores de autenticação

```typescript
export enum AuthProvider {
  EMAIL = 'email',    // Login com email e senha
  GOOGLE = 'google',  // Login com Google
  APPLE = 'apple'     // Login com Apple
}
```

| Valor | Descrição |
|-------|-----------|
| `email` | Login com email e senha |
| `google` | Login com Google |
| `apple` | Login com Apple |

---

## BUSINESS Enums

### BusinessRole
**Arquivo**: `src/modules/business/shared/enums/business-role.enum.ts`

**Descrição**: Papéis dentro de um estabelecimento

```typescript
export enum BusinessRole {
  OWNER = 'business_owner',           // Proprietário
  ADMIN = 'business_admin',           // Administrador
  SALES = 'business_sales',           // Vendedor
  STOCK = 'business_stock',           // Gerenciador de Estoque
  MARKETING = 'business_marketing'    // Marketing
}
```

| Valor | Descrição |
|-------|-----------|
| `business_owner` | Proprietário |
| `business_admin` | Administrador |
| `business_sales` | Vendedor |
| `business_stock` | Gerenciador de Estoque |
| `business_marketing` | Marketing |

---

### ExpenseCategory
**Arquivo**: `src/modules/business/shared/enums/expense-category.enum.ts`

**Descrição**: Categorias de despesas

```typescript
export enum ExpenseCategory {
  INVENTORY_PURCHASE = 'inventory_purchase',    // Compra de mercadorias
  RENT = 'rent',                                // Aluguel
  UTILITIES = 'utilities',                      // Água, luz, gás
  INTERNET_PHONE = 'internet_phone',            // Internet e telefone
  SALARIES = 'salaries',                        // Salários e folha de pagamento
  TAXES = 'taxes',                              // Impostos
  MAINTENANCE = 'maintenance',                  // Manutenção
  MARKETING = 'marketing',                      // Marketing e publicidade
  FUEL = 'fuel',                                // Combustível
  CLEANING = 'cleaning',                        // Material de limpeza
  OFFICE_SUPPLIES = 'office_supplies',          // Material de escritório
  DELIVERY = 'delivery',                        // Despesas com delivery
  EQUIPMENT = 'equipment',                      // Equipamentos
  SOFTWARE = 'software',                        // Software e sistemas
  INSURANCE = 'insurance',                      // Seguros
  BANK_FEES = 'bank_fees',                      // Taxas bancárias
  OTHER = 'other'                               // Outras despesas
}
```

| Valor | Descrição |
|-------|-----------|
| `inventory_purchase` | Compra de Mercadorias |
| `rent` | Aluguel |
| `utilities` | Água, Luz e Gás |
| `internet_phone` | Internet e Telefone |
| `salaries` | Salários |
| `taxes` | Impostos |
| `maintenance` | Manutenção |
| `marketing` | Marketing |
| `fuel` | Combustível |
| `cleaning` | Material de Limpeza |
| `office_supplies` | Material de Escritório |
| `delivery` | Despesas com Delivery |
| `equipment` | Equipamentos |
| `software` | Software e Sistemas |
| `insurance` | Seguros |
| `bank_fees` | Taxas Bancárias |
| `other` | Outras Despesas |

---

### ExpenseStatus
**Arquivo**: `src/modules/business/shared/enums/expense-status.enum.ts`

**Descrição**: Status de uma despesa

```typescript
export enum ExpenseStatus {
  PENDING = 'pending',      // Pendente de pagamento
  PAID = 'paid',            // Pago
  OVERDUE = 'overdue',      // Vencido
  CANCELLED = 'cancelled'   // Cancelado
}
```

| Valor | Descrição |
|-------|-----------|
| `pending` | Pendente de pagamento |
| `paid` | Pago |
| `overdue` | Vencido |
| `cancelled` | Cancelado |

---

### BusinessPlanType
**Arquivo**: `src/modules/business/shared/enums/business-plan-type.enum.ts`

**Descrição**: Tipos de plano para negócios

```typescript
export enum BusinessPlanType {
  BASIC = 'basic',              // Plano Básico
  PROFESSIONAL = 'professional', // Plano Profissional
  ENTERPRISE = 'enterprise'      // Plano Enterprise
}
```

| Valor | Descrição |
|-------|-----------|
| `basic` | Plano Básico |
| `professional` | Plano Profissional |
| `enterprise` | Plano Enterprise |

---

### PurchaseOrderStatus
**Arquivo**: `src/modules/business/shared/enums/purchase-order-status.enum.ts`

**Descrição**: Status de um pedido de compra

```typescript
export enum PurchaseOrderStatus {
  PENDING = 'pending',      // Pendente
  APPROVED = 'approved',    // Aprovado
  DELIVERED = 'delivered',  // Entregue
  CANCELLED = 'cancelled'   // Cancelado
}
```

| Valor | Descrição |
|-------|-----------|
| `pending` | Pendente |
| `approved` | Aprovado |
| `delivered` | Entregue |
| `cancelled` | Cancelado |

---

### SaleStatus
**Arquivo**: `src/modules/business/shared/enums/sale-status.enum.ts`

**Descrição**: Status de uma venda

```typescript
export enum SaleStatus {
  COMPLETED = 'completed',  // Concluída
  CANCELLED = 'cancelled',  // Cancelada
  PENDING = 'pending'       // Pendente
}
```

| Valor | Descrição |
|-------|-----------|
| `completed` | Concluída |
| `cancelled` | Cancelada |
| `pending` | Pendente |

---

### StockMovementType
**Arquivo**: `src/modules/business/shared/enums/stock-movement-type.enum.ts`

**Descrição**: Tipos de movimentação de estoque

```typescript
export enum StockMovementType {
  ENTRY = 'entry',          // Entrada
  SALE = 'sale',            // Venda
  ADJUSTMENT = 'adjustment', // Ajuste
  LOSS = 'loss',            // Perda
  RETURN = 'return'         // Devolução
}
```

| Valor | Descrição |
|-------|-----------|
| `entry` | Entrada |
| `sale` | Venda |
| `adjustment` | Ajuste |
| `loss` | Perda |
| `return` | Devolução |

---

### SubscriptionStatus
**Arquivo**: `src/modules/business/shared/enums/subscription-status.enum.ts`

**Descrição**: Status de uma assinatura

```typescript
export enum SubscriptionStatus {
  ACTIVE = 'active',        // Ativa
  EXPIRED = 'expired',      // Expirada
  CANCELLED = 'cancelled',  // Cancelada
  TRIAL = 'trial'           // Período de trial
}
```

| Valor | Descrição |
|-------|-----------|
| `active` | Ativa |
| `expired` | Expirada |
| `cancelled` | Cancelada |
| `trial` | Período de trial |

