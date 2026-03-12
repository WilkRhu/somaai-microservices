# Status de Implementação de Enums

## ❌ Problema Identificado

As entidades criadas estão usando **strings hardcoded** ao invés de **enums TypeScript**.

### ❌ Forma Atual (Errada)

```typescript
@Column({
  type: 'enum',
  enum: ['PRODUCT', 'SERVICE'],
  default: 'PRODUCT',
})
type: string;
```

### ✅ Forma Correta

```typescript
import { PurchaseType } from '../enums/purchase-type.enum';

@Column({
  type: 'enum',
  enum: PurchaseType,
  default: PurchaseType.PRODUCT,
})
type: PurchaseType;
```

---

## 📊 Comparação: Enums Necessários vs Implementados

### SHARED Enums

| Enum | Necessário | Implementado | Status |
|------|-----------|--------------|--------|
| UserRole | ✅ | ❌ | Faltando |
| PaymentMethod | ✅ | ❌ | Faltando |
| AuthProvider | ✅ | ✅ (User.entity) | Parcial |

### BUSINESS Enums

| Enum | Necessário | Implementado | Status |
|------|-----------|--------------|--------|
| BusinessRole | ✅ | ❌ | Faltando |
| ExpenseCategory | ✅ | ❌ | Faltando |
| ExpenseStatus | ✅ | ❌ | Faltando |
| BusinessPlanType | ✅ | ❌ | Faltando |
| PurchaseOrderStatus | ✅ | ❌ | Faltando |
| SaleStatus | ✅ | ❌ | Faltando |
| StockMovementType | ✅ | ❌ | Faltando |
| SubscriptionStatus | ✅ | ❌ | Faltando |

### PURCHASE Enums

| Enum | Necessário | Implementado | Status |
|------|-----------|--------------|--------|
| PurchaseType | ✅ | ❌ (hardcoded) | Faltando |
| PurchaseStatus | ✅ | ❌ (hardcoded) | Faltando |
| PaymentMethod | ✅ | ❌ (hardcoded) | Faltando |
| InstallmentStatus | ✅ | ❌ (hardcoded) | Faltando |

---

## 🔧 Enums a Criar

### 1. Shared Enums

```typescript
// src/shared/enums/user-role.enum.ts
export enum UserRole {
  USER = 'USER',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  ADMIN = 'ADMIN',
}

// src/shared/enums/auth-provider.enum.ts
export enum AuthProvider {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
}

// src/shared/enums/payment-method.enum.ts
export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  PIX = 'PIX',
  BOLETO = 'BOLETO',
  TRANSFER = 'TRANSFER',
}
```

### 2. Purchase Enums

```typescript
// src/purchases/enums/purchase-type.enum.ts
export enum PurchaseType {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
}

// src/purchases/enums/purchase-status.enum.ts
export enum PurchaseStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// src/purchases/enums/installment-status.enum.ts
export enum InstallmentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}
```

### 3. Product Enums

```typescript
// src/products/enums/product-unit.enum.ts
export enum ProductUnit {
  UN = 'UN',      // Unidade
  KG = 'KG',      // Quilograma
  L = 'L',        // Litro
  M = 'M',        // Metro
  M2 = 'M2',      // Metro quadrado
  M3 = 'M3',      // Metro cúbico
}
```

### 4. User Enums

```typescript
// src/users/enums/user-role.enum.ts
export enum UserRole {
  USER = 'USER',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  ADMIN = 'ADMIN',
}

// src/users/enums/address-type.enum.ts
export enum AddressType {
  PERSONAL = 'PERSONAL',
  DELIVERY = 'DELIVERY',
  BILLING = 'BILLING',
}
```

---

## 🔄 Entidades a Atualizar

### User Entity

```typescript
import { UserRole } from '../enums/user-role.enum';
import { AuthProvider } from '../../shared/enums/auth-provider.enum';

@Column({
  type: 'enum',
  enum: UserRole,
  default: UserRole.USER,
})
role: UserRole;

@Column({
  type: 'enum',
  enum: AuthProvider,
  default: AuthProvider.EMAIL,
})
authProvider: AuthProvider;
```

### UserAddress Entity

```typescript
import { AddressType } from '../enums/address-type.enum';

@Column({
  type: 'enum',
  enum: AddressType,
  default: AddressType.PERSONAL,
})
type: AddressType;
```

### Purchase Entity

```typescript
import { PurchaseType } from '../enums/purchase-type.enum';
import { PurchaseStatus } from '../enums/purchase-status.enum';
import { PaymentMethod } from '../../shared/enums/payment-method.enum';

@Column({
  type: 'enum',
  enum: PurchaseType,
  default: PurchaseType.PRODUCT,
})
type: PurchaseType;

@Column({
  type: 'enum',
  enum: PurchaseStatus,
  default: PurchaseStatus.COMPLETED,
})
status: PurchaseStatus;

@Column({
  type: 'enum',
  enum: PaymentMethod,
  nullable: true,
})
paymentMethod: PaymentMethod;
```

### PurchaseInstallment Entity

```typescript
import { InstallmentStatus } from '../enums/installment-status.enum';

@Column({
  type: 'enum',
  enum: InstallmentStatus,
  default: InstallmentStatus.PENDING,
})
status: InstallmentStatus;
```

### Product Entity

```typescript
import { ProductUnit } from '../enums/product-unit.enum';

@Column({
  type: 'enum',
  enum: ProductUnit,
  default: ProductUnit.UN,
})
unit: ProductUnit;
```

---

## ✅ Plano de Ação

1. ✅ Criar todos os enums TypeScript
2. ✅ Atualizar todas as entidades
3. ✅ Sincronizar banco de dados
4. ✅ Testar

---

## 📁 Estrutura de Pastas

```
services/monolith/src/
├── shared/
│   └── enums/
│       ├── user-role.enum.ts
│       ├── auth-provider.enum.ts
│       └── payment-method.enum.ts
├── users/
│   ├── entities/
│   │   ├── user.entity.ts
│   │   ├── user-address.entity.ts
│   │   └── user-card.entity.ts
│   └── enums/
│       ├── user-role.enum.ts
│       └── address-type.enum.ts
├── products/
│   ├── entities/
│   │   └── product.entity.ts
│   └── enums/
│       └── product-unit.enum.ts
└── purchases/
    ├── entities/
    │   ├── purchase.entity.ts
    │   ├── purchase-item.entity.ts
    │   └── purchase-installment.entity.ts
    └── enums/
        ├── purchase-type.enum.ts
        ├── purchase-status.enum.ts
        └── installment-status.enum.ts
```

---

## 🎯 Benefícios de Usar Enums

✅ **Type Safety** - Evita erros de digitação
✅ **Autocomplete** - IDE sugere valores válidos
✅ **Validação** - Garante valores válidos
✅ **Documentação** - Código auto-documentado
✅ **Refatoração** - Fácil renomear valores
✅ **Testes** - Mais fácil testar

---

## ⚠️ Importante

Sem enums TypeScript:
- ❌ Fácil digitar valor errado
- ❌ Sem autocomplete
- ❌ Sem validação em tempo de compilação
- ❌ Código menos legível

Com enums TypeScript:
- ✅ Segurança de tipo
- ✅ Autocomplete automático
- ✅ Validação em tempo de compilação
- ✅ Código mais legível e mantível

