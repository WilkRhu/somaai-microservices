# Entidades Criadas - TypeORM com Sincronização Automática

## ✅ O que foi criado

### 1. User Entity (Atualizada)
**Arquivo**: `services/monolith/src/users/entities/user.entity.ts`

Campos adicionados:
- `cpf` - CPF único
- `authProvider` - EMAIL, GOOGLE, FACEBOOK
- `googleId`, `facebookId` - IDs dos provedores
- `role` - USER, BUSINESS_OWNER, ADMIN
- `planType`, `planExpiresAt`, `billingCycle` - Plano do usuário
- `isOnTrial`, `trialEndsAt` - Período de trial
- `mercadoPagoCustomerId` - ID no MercadoPago
- `hasCompletedOnboarding` - Status do onboarding
- `netIncome`, `profession` - Dados profissionais
- `scansUsed`, `scansResetAt` - Limite de scans

Relacionamentos:
- 1:N com UserAddress
- 1:N com UserCard
- 1:N com Purchase

---

### 2. UserAddress Entity
**Arquivo**: `services/monolith/src/users/entities/user-address.entity.ts`

Campos:
- `street`, `number`, `complement` - Endereço
- `district`, `city`, `state`, `zipCode` - Localização
- `latitude`, `longitude` - Coordenadas
- `type` - PERSONAL, DELIVERY, BILLING
- `isDefault` - Endereço padrão

Relacionamento:
- N:1 com User (cascade delete)

---

### 3. UserCard Entity
**Arquivo**: `services/monolith/src/users/entities/user-card.entity.ts`

Campos:
- `cardNumber` - Número do cartão
- `cardholderName` - Nome do titular
- `expiryMonth`, `expiryYear` - Validade
- `cvv` - Código de segurança
- `isDefault` - Cartão padrão

Relacionamento:
- N:1 com User (cascade delete)

---

### 4. Product Entity
**Arquivo**: `services/monolith/src/products/entities/product.entity.ts`

Campos:
- `barcode`, `gtin` - Códigos de produto
- `name`, `category`, `brand` - Informações básicas
- `costPrice`, `salePrice` - Preços
- `quantity`, `minQuantity` - Estoque
- `unit` - Unidade (un, kg, l, etc)
- `expirationDate` - Validade
- `images`, `description` - Mídia
- Campos fiscais: `ncm`, `cfop`, `cst`, `csosn`, `aliquotaIcms`, etc

Índices:
- barcode (unique)
- gtin (unique)
- name, category, brand

Relacionamento:
- 1:N com PurchaseItem

---

### 5. Purchase Entity
**Arquivo**: `services/monolith/src/purchases/entities/purchase.entity.ts`

Campos:
- `userId` - FK para User
- `type` - PRODUCT, SERVICE
- `merchant` - Estabelecimento
- `description` - Descrição
- `totalAmount` - Valor total
- `status` - PENDING, COMPLETED, CANCELLED
- `paymentMethod` - CASH, CARD, PIX, BOLETO, TRANSFER
- `installments` - Número de parcelas
- `interestRate` - Taxa de juros
- `purchasedAt` - Data da compra

Relacionamentos:
- N:1 com User (cascade delete)
- 1:N com PurchaseItem (cascade)
- 1:N com PurchaseInstallment (cascade)

---

### 6. PurchaseItem Entity
**Arquivo**: `services/monolith/src/purchases/entities/purchase-item.entity.ts`

Campos:
- `purchaseId` - FK para Purchase
- `productId` - FK para Product (opcional)
- `productName` - Nome do produto
- `quantity` - Quantidade
- `unitPrice` - Preço unitário
- `totalPrice` - Preço total

Relacionamentos:
- N:1 com Purchase (cascade delete)
- N:1 com Product (set null)

---

### 7. PurchaseInstallment Entity
**Arquivo**: `services/monolith/src/purchases/entities/purchase-installment.entity.ts`

Campos:
- `purchaseId` - FK para Purchase
- `installmentNumber` - Número da parcela
- `amount` - Valor da parcela
- `dueDate` - Data de vencimento
- `status` - PENDING, PAID, OVERDUE
- `paidAt` - Data de pagamento

Relacionamento:
- N:1 com Purchase (cascade delete)

---

## 🔄 Sincronização Automática

### Como funciona

1. **TypeORM detecta as entidades** através de:
   ```typescript
   entities: [__dirname + '/**/*.entity{.ts,.js}']
   ```

2. **Sincroniza automaticamente** quando:
   ```typescript
   synchronize: true
   ```

3. **Cria/atualiza tabelas** no banco de dados automaticamente

### Configuração no app.module.ts

```typescript
TypeOrmModule.forRoot({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'somaai_monolith',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true, // ✅ Sincroniza automaticamente
  logging: process.env.DB_LOGGING === 'true',
})
```

---

## 📊 Estrutura de Pastas

```
services/monolith/src/
├── users/
│   └── entities/
│       ├── user.entity.ts
│       ├── user-address.entity.ts
│       └── user-card.entity.ts
├── products/
│   └── entities/
│       └── product.entity.ts
└── purchases/
    └── entities/
        ├── purchase.entity.ts
        ├── purchase-item.entity.ts
        └── purchase-installment.entity.ts
```

---

## 🚀 Próximos Passos

1. ✅ Entidades criadas
2. ⏳ Iniciar Monolith Service para sincronizar banco
3. ⏳ Criar DTOs (Data Transfer Objects)
4. ⏳ Criar Controllers
5. ⏳ Criar Services
6. ⏳ Implementar rotas

---

## 🧪 Como Testar

### 1. Iniciar o Monolith Service

```bash
cd services/monolith
npm install
npm run start:dev
```

### 2. Verificar Sincronização

Você verá logs como:
```
[TypeOrmModule] Database synchronized successfully
```

### 3. Verificar Tabelas no MySQL

```bash
mysql -u root -p somaai_monolith
SHOW TABLES;
DESCRIBE users;
DESCRIBE user_addresses;
DESCRIBE user_cards;
DESCRIBE products;
DESCRIBE purchases;
DESCRIBE purchase_items;
DESCRIBE purchase_installments;
```

---

## 📝 Índices Criados

### Users
- `email` (unique)
- `cpf` (unique, where cpf IS NOT NULL)

### UserAddress
- `userId`

### UserCard
- `userId`

### Product
- `barcode` (unique)
- `gtin` (unique)
- `name`, `category`, `brand`

### Purchase
- `userId`, `purchasedAt`
- `userId`, `type`, `purchasedAt`

### PurchaseItem
- `purchaseId`
- `productId`

### PurchaseInstallment
- `purchaseId`, `installmentNumber`
- `dueDate`, `status`

---

## ✨ Benefícios

✅ Sem SQL manual
✅ Sincronização automática
✅ Versionamento de schema com código
✅ Fácil de manter
✅ Relacionamentos bem definidos
✅ Índices otimizados
✅ Cascade delete configurado

---

## ⚠️ Importante

- **Sincronização automática** é ótima para desenvolvimento
- **Em produção**, use migrations ao invés de `synchronize: true`
- Sempre faça backup antes de sincronizar em produção

