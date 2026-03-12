# Documentação Completa de Todas as Entidades do Sistema

## 📋 Índice Geral

### Módulos (20 total)
1. [AUTH](#auth-module)
2. [USERS](#users-module)
3. [BUSINESS/ESTABLISHMENTS](#businessestablishments-module)
4. [BUSINESS/CUSTOMERS](#businesscustomers-module)
5. [BUSINESS/INVENTORY](#businessinventory-module)
6. [BUSINESS/SALES](#businesssales-module)
7. [BUSINESS/DELIVERY](#businessdelivery-module)
8. [BUSINESS/FISCAL](#businessfiscal-module)
9. [BUSINESS/EXPENSES](#businessexpenses-module)
10. [BUSINESS/OFFERS](#businessoffers-module)
11. [BUSINESS/SUPPLIERS](#businesssuppliers-module)
12. [LOGS](#logs-module)
13. [NOTIFICATIONS](#notifications-module)
14. [PAYMENTS](#payments-module)
15. [PRICES](#prices-module)
16. [PRODUCTS](#products-module)
17. [PURCHASES](#purchases-module)
18. [REPORTS](#reports-module)
19. [SHOPPING-LISTS](#shopping-lists-module)
20. [TICKETS](#tickets-module)

---

## AUTH Module

### VerificationCode
**Tabela**: `verification_codes`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `email` | VARCHAR(255) | ❌ | Email para verificação |
| `code` | VARCHAR(10) | ❌ | Código de verificação |
| `expiresAt` | TIMESTAMP | ❌ | Expiração do código |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |

---

## USERS Module

### User
**Tabela**: `users`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `cpf` | VARCHAR(14) | ✅ | CPF único |
| `name` | VARCHAR(255) | ❌ | Nome completo |
| `email` | VARCHAR(255) | ❌ | Email único |
| `password` | VARCHAR(255) | ❌ | Senha (hash) |
| `authProvider` | ENUM | ✅ | Provedor: EMAIL, GOOGLE, FACEBOOK |
| `role` | ENUM | ❌ | Papel: USER, ADMIN, BUSINESS_OWNER |
| `avatar` | VARCHAR(500) | ✅ | URL do avatar |
| `isActive` | BOOLEAN | ❌ | Status ativo |
| `planType` | VARCHAR(20) | ✅ | Tipo de plano |
| `planExpiresAt` | DATETIME | ✅ | Expiração do plano |
| `isOnTrial` | BOOLEAN | ✅ | Em período de trial |
| `trialEndsAt` | DATETIME | ✅ | Fim do trial |
| `mercadoPagoCustomerId` | VARCHAR(255) | ✅ | ID Mercado Pago |
| `hasCompletedOnboarding` | BOOLEAN | ✅ | Onboarding completo |
| `netIncome` | DECIMAL(10,2) | ✅ | Renda líquida |
| `profession` | VARCHAR(255) | ✅ | Profissão |
| `phone` | VARCHAR(20) | ✅ | Telefone |
| `birthDate` | DATE | ✅ | Data de nascimento |
| `scansUsed` | INT | ✅ | Scans utilizados |
| `scansResetAt` | DATETIME | ✅ | Reset de scans |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |

**Relacionamentos**:
- 1:N com Purchase
- 1:N com UserCard
- 1:N com UserAddress

---

### UserAddress
**Tabela**: `user_addresses`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `userId` | UUID | ❌ | FK para User |
| `street` | VARCHAR(255) | ❌ | Rua |
| `number` | VARCHAR(10) | ❌ | Número |
| `complement` | VARCHAR(255) | ✅ | Complemento |
| `district` | VARCHAR(100) | ❌ | Bairro |
| `city` | VARCHAR(100) | ❌ | Cidade |
| `state` | VARCHAR(2) | ❌ | Estado |
| `zipCode` | VARCHAR(10) | ❌ | CEP |
| `latitude` | DECIMAL(10,8) | ✅ | Latitude |
| `longitude` | DECIMAL(11,8) | ✅ | Longitude |
| `isDefault` | BOOLEAN | ❌ | Endereço padrão |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |

---

### UserCard
**Tabela**: `user_cards`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `userId` | UUID | ❌ | FK para User |
| `cardNumber` | VARCHAR(20) | ❌ | Número do cartão (criptografado) |
| `cardholderName` | VARCHAR(255) | ❌ | Nome do titular |
| `expiryMonth` | INT | ❌ | Mês de expiração |
| `expiryYear` | INT | ❌ | Ano de expiração |
| `cvv` | VARCHAR(10) | ❌ | CVV (criptografado) |
| `isDefault` | BOOLEAN | ❌ | Cartão padrão |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |

---

### UserBusinessPlan
**Tabela**: `user_business_plans`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `userId` | UUID | ❌ | FK para User |
| `planName` | VARCHAR(100) | ❌ | Nome do plano |
| `price` | DECIMAL(10,2) | ❌ | Preço |
| `billingCycle` | VARCHAR(20) | ❌ | Ciclo: MONTHLY, YEARLY |
| `startDate` | DATE | ❌ | Data de início |
| `endDate` | DATE | ✅ | Data de término |
| `isActive` | BOOLEAN | ❌ | Ativo |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |

---

### UserSomaaiPlan
**Tabela**: `user_somaai_plans`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `userId` | UUID | ❌ | FK para User |
| `planName` | VARCHAR(100) | ❌ | Nome do plano |
| `price` | DECIMAL(10,2) | ❌ | Preço |
| `billingCycle` | VARCHAR(20) | ❌ | Ciclo: MONTHLY, YEARLY |
| `startDate` | DATE | ❌ | Data de início |
| `endDate` | DATE | ✅ | Data de término |
| `isActive` | BOOLEAN | ❌ | Ativo |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |

---

## BUSINESS/ESTABLISHMENTS Module

### Establishment
**Tabela**: `business_establishments`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `name` | VARCHAR(255) | ❌ | Nome |
| `cnpj` | VARCHAR(18) | ❌ | CNPJ (unique) |
| `type` | VARCHAR(100) | ❌ | Tipo de negócio |
| `phone` | VARCHAR(20) | ✅ | Telefone |
| `email` | VARCHAR(255) | ✅ | Email |
| `address` | TEXT | ✅ | Endereço |
| `city` | VARCHAR(100) | ✅ | Cidade |
| `state` | VARCHAR(2) | ✅ | Estado |
| `zipCode` | VARCHAR(10) | ✅ | CEP |
| `latitude` | DECIMAL(10,8) | ✅ | Latitude |
| `longitude` | DECIMAL(11,8) | ✅ | Longitude |
| `businessHours` | JSON | ✅ | Horário de funcionamento |
| `logo` | VARCHAR(500) | ✅ | URL do logo |
| `description` | TEXT | ✅ | Descrição |
| `cashRegistersCount` | INT | ❌ | Quantidade de caixas |
| `loyaltyEnabled` | BOOLEAN | ❌ | Programa de fidelidade ativo |
| `loyaltyPointsPerReal` | DECIMAL(5,3) | ❌ | Pontos por real gasto |
| `ownerId` | VARCHAR(36) | ❌ | FK para User (proprietário) |
| `isActive` | BOOLEAN | ❌ | Ativo |
| `inscricaoEstadual` | VARCHAR(20) | ✅ | Inscrição Estadual |
| `inscricaoMunicipal` | VARCHAR(20) | ✅ | Inscrição Municipal |
| `regimeTributario` | VARCHAR(1) | ✅ | Regime: 1=Simples, 2=Simples Excesso, 3=Normal |
| `cnae` | VARCHAR(10) | ✅ | CNAE |
| `inscricaoEstadualSt` | VARCHAR(20) | ✅ | IE Substituição Tributária |
| `crt` | VARCHAR(1) | ✅ | Código Regime Tributário |
| `fiscalAddress` | JSON | ✅ | Endereço fiscal |
| `fiscalContact` | JSON | ✅ | Contato fiscal |
| `autoIssueFiscalNote` | BOOLEAN | ❌ | Emissão automática de NF |
| `fiscalProvider` | VARCHAR(50) | ✅ | Provedor fiscal |
| `fiscalEnvironment` | VARCHAR(20) | ✅ | Ambiente fiscal |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |
| `deletedAt` | TIMESTAMP | ✅ | Data de exclusão (soft delete) |

---

### EstablishmentMember
**Tabela**: `establishment_members`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `establishmentId` | UUID | ❌ | FK para Establishment |
| `userId` | UUID | ❌ | FK para User |
| `role` | ENUM | ❌ | Papel: OWNER, MANAGER, CASHIER, DELIVERY |
| `joinedAt` | TIMESTAMP | ❌ | Data de entrada |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |

---

### EstablishmentMercadoPagoIntegration
**Tabela**: `establishment_mercadopago_integrations`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `establishmentId` | UUID | ❌ | FK para Establishment |
| `accessToken` | TEXT | ❌ | Token de acesso (criptografado) |
| `refreshToken` | TEXT | ✅ | Token de refresh (criptografado) |
| `publicKey` | VARCHAR(255) | ❌ | Chave pública |
| `userId` | VARCHAR(255) | ❌ | ID do usuário MP |
| `isActive` | BOOLEAN | ❌ | Ativo |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |


---

## BUSINESS/CUSTOMERS Module

### Customer
**Tabela**: `business_customers`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `establishmentId` | VARCHAR(36) | ❌ | FK para Establishment |
| `name` | VARCHAR(255) | ❌ | Nome |
| `email` | VARCHAR(255) | ✅ | Email |
| `phone` | VARCHAR(20) | ✅ | Telefone |
| `cpf` | VARCHAR(14) | ✅ | CPF |
| `avatar` | VARCHAR(500) | ✅ | Avatar |
| `birthDate` | DATE | ✅ | Data de nascimento |
| `loyaltyPoints` | INT | ❌ | Pontos de fidelidade |
| `totalSpent` | DECIMAL(10,2) | ❌ | Total gasto |
| `purchaseCount` | INT | ❌ | Quantidade de compras |
| `lastPurchaseDate` | TIMESTAMP | ✅ | Última compra |
| `isActive` | BOOLEAN | ❌ | Ativo |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |

---

## BUSINESS/INVENTORY Module

### InventoryItem
**Tabela**: `inventory_items`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `establishmentId` | VARCHAR(36) | ❌ | FK para Establishment |
| `barcode` | VARCHAR(50) | ✅ | Código de barras |
| `name` | VARCHAR(255) | ❌ | Nome do produto |
| `category` | VARCHAR(100) | ✅ | Categoria |
| `brand` | VARCHAR(100) | ✅ | Marca |
| `costPrice` | DECIMAL(10,2) | ❌ | Preço de custo |
| `salePrice` | DECIMAL(10,2) | ❌ | Preço de venda |
| `quantity` | INT | ❌ | Quantidade em estoque |
| `minQuantity` | INT | ❌ | Quantidade mínima |
| `unit` | VARCHAR(20) | ❌ | Unidade (un, kg, l, etc) |
| `expirationDate` | DATE | ✅ | Data de validade |
| `images` | TEXT | ✅ | Array de URLs de imagens (JSON) |
| `description` | TEXT | ✅ | Descrição |
| `isActive` | BOOLEAN | ❌ | Ativo |
| `ncm` | VARCHAR(8) | ✅ | Nomenclatura Comum Mercosul |
| `cfop` | VARCHAR(4) | ✅ | Código Fiscal de Operações |
| `cst` | VARCHAR(3) | ✅ | Código Situação Tributária |
| `csosn` | VARCHAR(4) | ✅ | Código Simples Nacional |
| `aliquotaIcms` | DECIMAL(5,2) | ❌ | Alíquota ICMS (%) |
| `aliquotaPis` | DECIMAL(5,2) | ❌ | Alíquota PIS (%) |
| `aliquotaCofins` | DECIMAL(5,2) | ❌ | Alíquota COFINS (%) |
| `aliquotaIpi` | DECIMAL(5,2) | ❌ | Alíquota IPI (%) |
| `fiscalUnit` | VARCHAR(10) | ✅ | Unidade Tributável |
| `gtin` | VARCHAR(14) | ✅ | Código GTIN (EAN/UPC) |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |
| `deletedAt` | TIMESTAMP | ✅ | Data de exclusão (soft delete) |

**Índices**:
- `IDX_INVENTORY_BARCODE` (barcode, establishmentId)
- `IDX_INVENTORY_ESTABLISHMENT` (establishmentId)
- `IDX_INVENTORY_NAME` (name)
- `IDX_INVENTORY_NCM` (ncm)
- `IDX_INVENTORY_CFOP` (cfop)
- `IDX_INVENTORY_GTIN` (gtin)

---

### StockMovement
**Tabela**: `stock_movements`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `inventoryItemId` | UUID | ❌ | FK para InventoryItem |
| `saleId` | UUID | ✅ | FK para Sale |
| `type` | ENUM | ❌ | Tipo: IN, OUT, ADJUSTMENT, RETURN |
| `quantity` | INT | ❌ | Quantidade movimentada |
| `reason` | VARCHAR(255) | ✅ | Motivo |
| `notes` | TEXT | ✅ | Notas |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |

**Índices**:
- `IDX_STOCK_MOVEMENT_ITEM` (inventoryItemId)
- `IDX_STOCK_MOVEMENT_SALE` (saleId)

---

## BUSINESS/SALES Module

### Sale
**Tabela**: `sales`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `establishmentId` | UUID | ❌ | FK para Establishment |
| `saleNumber` | VARCHAR(50) | ❌ | Número da venda (unique) |
| `subtotal` | DECIMAL(10,2) | ❌ | Subtotal |
| `discount` | DECIMAL(10,2) | ❌ | Desconto |
| `total` | DECIMAL(10,2) | ❌ | Total |
| `paymentMethod` | ENUM | ❌ | Método: CASH, CARD, PIX, BOLETO |
| `status` | ENUM | ❌ | Status: COMPLETED, CANCELLED, PENDING |
| `customerId` | UUID | ✅ | FK para Customer |
| `sellerId` | UUID | ❌ | FK para User (vendedor) |
| `cashRegisterId` | INT | ✅ | ID do caixa |
| `notes` | TEXT | ✅ | Observações |
| `cancellationReason` | TEXT | ✅ | Motivo do cancelamento |
| `fiscalNoteId` | UUID | ✅ | FK para FiscalNote |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |

---

### SaleItem
**Tabela**: `sale_items`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `saleId` | UUID | ❌ | FK para Sale |
| `inventoryItemId` | UUID | ❌ | FK para InventoryItem |
| `quantity` | INT | ❌ | Quantidade |
| `unitPrice` | DECIMAL(10,2) | ❌ | Preço unitário |
| `discount` | DECIMAL(10,2) | ❌ | Desconto |
| `total` | DECIMAL(10,2) | ❌ | Total |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |


---

## BUSINESS/DELIVERY Module

### DeliveryOrder
**Tabela**: `delivery_orders`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `establishmentId` | VARCHAR(36) | ❌ | FK para Establishment |
| `userId` | VARCHAR(36) | ✅ | FK para User |
| `saleId` | VARCHAR(36) | ❌ | FK para Sale |
| `customerId` | VARCHAR(36) | ❌ | FK para Customer |
| `orderNumber` | VARCHAR(50) | ❌ | Número do pedido (unique) |
| `customerName` | VARCHAR(255) | ❌ | Nome do cliente |
| `customerPhone` | VARCHAR(20) | ❌ | Telefone do cliente |
| `addressId` | VARCHAR(36) | ✅ | FK para DeliveryAddress |
| `deliveryAddress` | VARCHAR(500) | ❌ | Endereço de entrega |
| `deliveryNeighborhood` | VARCHAR(255) | ❌ | Bairro |
| `deliveryCity` | VARCHAR(255) | ❌ | Cidade |
| `deliveryState` | VARCHAR(2) | ❌ | Estado |
| `deliveryZipCode` | VARCHAR(20) | ❌ | CEP |
| `deliveryComplement` | VARCHAR(255) | ✅ | Complemento |
| `deliveryReference` | VARCHAR(500) | ✅ | Referência |
| `latitude` | DECIMAL(10,8) | ✅ | Latitude |
| `longitude` | DECIMAL(11,8) | ✅ | Longitude |
| `subtotal` | DECIMAL(10,2) | ❌ | Subtotal |
| `deliveryFee` | DECIMAL(10,2) | ❌ | Taxa de entrega |
| `discount` | DECIMAL(10,2) | ❌ | Desconto |
| `total` | DECIMAL(10,2) | ❌ | Total |
| `deliveryZoneId` | VARCHAR(36) | ✅ | FK para DeliveryZone |
| `driverId` | VARCHAR(36) | ✅ | FK para DeliveryDriver |
| `estimatedDeliveryTime` | INT | ❌ | Tempo estimado (minutos) |
| `scheduledFor` | TIMESTAMP | ✅ | Agendado para |
| `status` | ENUM | ❌ | Status: PENDING, CONFIRMED, PREPARING, READY, DISPATCHED, DELIVERED, CANCELLED |
| `paymentMethod` | ENUM | ❌ | Método de pagamento |
| `paymentStatus` | ENUM | ❌ | Status: PENDING, PAID, FAILED |
| `isPaid` | TINYINT | ❌ | Pago |
| `notes` | TEXT | ✅ | Observações |
| `internalNotes` | TEXT | ✅ | Notas internas |
| `confirmedAt` | TIMESTAMP | ✅ | Confirmado em |
| `preparingAt` | TIMESTAMP | ✅ | Preparando em |
| `readyAt` | TIMESTAMP | ✅ | Pronto em |
| `dispatchedAt` | TIMESTAMP | ✅ | Despachado em |
| `deliveredAt` | TIMESTAMP | ✅ | Entregue em |
| `cancelledAt` | TIMESTAMP | ✅ | Cancelado em |
| `cancellationReason` | TEXT | ✅ | Motivo do cancelamento |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |

---

### DeliveryDriver
**Tabela**: `delivery_drivers`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `establishmentId` | UUID | ❌ | FK para Establishment |
| `name` | VARCHAR(255) | ❌ | Nome |
| `phone` | VARCHAR(20) | ❌ | Telefone |
| `cpf` | VARCHAR(14) | ✅ | CPF |
| `vehicleType` | ENUM | ❌ | Tipo: MOTORCYCLE, CAR, VAN, TRUCK |
| `vehiclePlate` | VARCHAR(10) | ✅ | Placa do veículo |
| `isActive` | BOOLEAN | ❌ | Ativo |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |

---

### DeliveryZone
**Tabela**: `delivery_zones`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `establishmentId` | UUID | ❌ | FK para Establishment |
| `name` | VARCHAR(255) | ❌ | Nome da zona |
| `deliveryFee` | DECIMAL(10,2) | ❌ | Taxa de entrega |
| `estimatedTime` | INT | ❌ | Tempo estimado (minutos) |
| `polygon` | JSON | ❌ | Polígono (coordenadas) |
| `isActive` | BOOLEAN | ❌ | Ativo |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |

---

### DeliveryAddress
**Tabela**: `delivery_addresses`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `customerId` | UUID | ❌ | FK para Customer |
| `street` | VARCHAR(255) | ❌ | Rua |
| `number` | VARCHAR(10) | ❌ | Número |
| `complement` | VARCHAR(255) | ✅ | Complemento |
| `district` | VARCHAR(100) | ❌ | Bairro |
| `city` | VARCHAR(100) | ❌ | Cidade |
| `state` | VARCHAR(2) | ❌ | Estado |
| `zipCode` | VARCHAR(10) | ❌ | CEP |
| `latitude` | DECIMAL(10,8) | ✅ | Latitude |
| `longitude` | DECIMAL(11,8) | ✅ | Longitude |
| `isDefault` | BOOLEAN | ❌ | Endereço padrão |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |

---

### DeliveryTracking
**Tabela**: `delivery_tracking`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `orderId` | UUID | ❌ | FK para DeliveryOrder |
| `driverId` | UUID | ✅ | FK para DeliveryDriver |
| `latitude` | DECIMAL(10,8) | ❌ | Latitude |
| `longitude` | DECIMAL(11,8) | ❌ | Longitude |
| `status` | VARCHAR(50) | ❌ | Status |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |

---

## BUSINESS/FISCAL Module

### FiscalNote
**Tabela**: `fiscal_notes`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `establishmentId` | UUID | ❌ | FK para Establishment |
| `saleId` | UUID | ✅ | FK para Sale |
| `type` | ENUM | ❌ | Tipo: nfe, nfce, nfse |
| `status` | ENUM | ❌ | Status: pending, processing, authorized, rejected, cancelled, denied, contingency |
| `number` | VARCHAR(20) | ✅ | Número da nota |
| `series` | VARCHAR(10) | ✅ | Série |
| `accessKey` | VARCHAR(44) | ✅ | Chave de acesso (unique) |
| `authorizationProtocol` | VARCHAR(50) | ✅ | Protocolo de autorização |
| `authorizedAt` | TIMESTAMP | ✅ | Data de autorização |
| `xml` | TEXT | ✅ | XML da nota |
| `cancellationXml` | TEXT | ✅ | XML de cancelamento |
| `danfeUrl` | VARCHAR(500) | ✅ | URL do DANFE |
| `qrCode` | TEXT | ✅ | QR Code |
| `consultUrl` | VARCHAR(500) | ✅ | URL de consulta |
| `recipient` | JSON | ✅ | Dados do destinatário |
| `items` | JSON | ❌ | Itens da nota |
| `totals` | JSON | ❌ | Totais |
| `additionalInfo` | TEXT | ✅ | Informações adicionais |
| `rejectionReason` | TEXT | ✅ | Motivo da rejeição |
| `cancellationReason` | TEXT | ✅ | Motivo do cancelamento |
| `cancelledAt` | TIMESTAMP | ✅ | Data do cancelamento |
| `rejectedAt` | TIMESTAMP | ✅ | Data da rejeição |
| `contingencyReason` | TEXT | ✅ | Motivo da contingência |
| `providerReferenceId` | VARCHAR(100) | ✅ | ID no provedor |
| `provider` | VARCHAR(50) | ✅ | Provedor |
| `environment` | VARCHAR(20) | ❌ | Ambiente: production, homologation |
| `emailSent` | BOOLEAN | ❌ | Email enviado |
| `smsSent` | BOOLEAN | ❌ | SMS enviado |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |

---

### FiscalCorrection
**Tabela**: `fiscal_corrections`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `fiscalNoteId` | UUID | ❌ | FK para FiscalNote (cascade delete) |
| `establishmentId` | UUID | ❌ | FK para Establishment |
| `sequence` | INT | ❌ | Sequencial (1, 2, 3...) |
| `correctionText` | TEXT | ❌ | Texto da correção |
| `status` | ENUM | ❌ | Status: pending, processing, authorized, rejected |
| `providerReferenceId` | VARCHAR(100) | ✅ | ID no provedor |
| `authorizationProtocol` | VARCHAR(50) | ✅ | Protocolo |
| `accessKey` | VARCHAR(44) | ✅ | Chave de acesso |
| `xml` | TEXT | ✅ | XML |
| `rejectionReason` | TEXT | ✅ | Motivo da rejeição |
| `authorizedAt` | TIMESTAMP | ✅ | Data de autorização |
| `createdById` | UUID | ✅ | FK para User |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |

---

### FiscalNumberDisablement
**Tabela**: `fiscal_number_disablement`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `establishmentId` | UUID | ❌ | FK para Establishment |
| `documentType` | VARCHAR(10) | ❌ | Tipo: nfe, nfce |
| `series` | VARCHAR(10) | ❌ | Série |
| `numberStart` | INT | ❌ | Número inicial |
| `numberEnd` | INT | ❌ | Número final |
| `reason` | TEXT | ❌ | Justificativa |
| `status` | ENUM | ❌ | Status: pending, processing, authorized, rejected |
| `providerReferenceId` | VARCHAR(100) | ✅ | ID no provedor |
| `authorizationProtocol` | VARCHAR(50) | ✅ | Protocolo |
| `accessKey` | VARCHAR(44) | ✅ | Chave de acesso |
| `xml` | TEXT | ✅ | XML |
| `rejectionReason` | TEXT | ✅ | Motivo da rejeição |
| `authorizedAt` | TIMESTAMP | ✅ | Data de autorização |
| `createdById` | UUID | ✅ | FK para User |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |

---

### FiscalCertificate
**Tabela**: `fiscal_certificates`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `establishmentId` | UUID | ❌ | FK para Establishment (unique) |
| `certificateData` | TEXT | ❌ | Dados do certificado (criptografado) |
| `certificatePassword` | TEXT | ❌ | Senha (criptografada) |
| `type` | VARCHAR(10) | ❌ | Tipo: A1, A3 |
| `cnpj` | VARCHAR(18) | ❌ | CNPJ |
| `holderName` | VARCHAR(255) | ❌ | Nome do titular |
| `expiresAt` | TIMESTAMP | ❌ | Data de expiração |
| `isActive` | BOOLEAN | ❌ | Ativo |
| `lastValidatedAt` | TIMESTAMP | ✅ | Última validação |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |

---

### FiscalContingencyNote
**Tabela**: `fiscal_contingency_notes`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `establishmentId` | UUID | ❌ | FK para Establishment |
| `originalNoteId` | UUID | ✅ | FK para FiscalNote |
| `documentType` | VARCHAR(20) | ❌ | Tipo: nfe, nfce, nfse |
| `series` | VARCHAR(10) | ❌ | Série |
| `number` | VARCHAR(20) | ❌ | Número |
| `recipient` | JSON | ✅ | Dados do destinatário |
| `items` | JSON | ❌ | Itens |
| `totals` | JSON | ❌ | Totais |
| `contingencyReason` | TEXT | ❌ | Motivo |
| `status` | ENUM | ❌ | Status: pending, transmitted, failed |
| `transmittedAt` | TIMESTAMP | ✅ | Data de transmissão |
| `failureReason` | TEXT | ✅ | Motivo da falha |
| `transmissionAttempts` | INT | ❌ | Tentativas |
| `lastTransmissionAttempt` | TIMESTAMP | ✅ | Última tentativa |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |

---

### FiscalAuditLog
**Tabela**: `fiscal_audit_logs`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `establishmentId` | UUID | ❌ | FK para Establishment |
| `userId` | UUID | ✅ | FK para User |
| `action` | VARCHAR(50) | ❌ | Ação: ISSUE, QUERY, CANCEL, CORRECTION, DISABLEMENT |
| `resourceType` | VARCHAR(50) | ❌ | Tipo: NOTE, CERTIFICATE, CORRECTION, DISABLEMENT |
| `resourceId` | VARCHAR(255) | ✅ | ID do recurso |
| `status` | VARCHAR(50) | ❌ | Status: SUCCESS, FAILURE, PENDING |
| `result` | TEXT | ✅ | Resultado |
| `errorMessage` | TEXT | ✅ | Mensagem de erro |
| `metadata` | JSON | ✅ | Metadados |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |

**Índices**:
- `IDX_fiscal_audit_logs_establishmentId_createdAt`
- `IDX_fiscal_audit_logs_userId_createdAt`
- `IDX_fiscal_audit_logs_action_createdAt`

---

### FiscalCertificateManagement
**Tabela**: `fiscal_certificate_management`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `establishmentId` | UUID | ❌ | FK para Establishment |
| `name` | VARCHAR(255) | ❌ | Nome |
| `type` | ENUM | ❌ | Tipo: A1, A3 |
| `certificateData` | TEXT | ❌ | Dados (base64 para A1) |
| `password` | VARCHAR(255) | ✅ | Senha (criptografada) |
| `tokenSerialNumber` | VARCHAR(255) | ✅ | Serial do token (A3) |
| `tokenLabel` | VARCHAR(255) | ✅ | Label do token (A3) |
| `certificateId` | VARCHAR(255) | ✅ | ID do certificado (A3) |
| `cnpj` | VARCHAR(255) | ✅ | CNPJ |
| `holderName` | VARCHAR(255) | ✅ | Nome do titular |
| `expiresAt` | DATETIME | ✅ | Data de expiração |
| `expirationWarningDays` | INT | ❌ | Dias para alerta (default: 30) |
| `operationTypes` | ENUM[] | ❌ | Tipos: NFE, NFCE, NFSE, CONTINGENCY, CORRECTION, DISABLEMENT |
| `isPrimary` | BOOLEAN | ❌ | Principal |
| `isActive` | BOOLEAN | ❌ | Ativo |
| `isBackup` | BOOLEAN | ❌ | Backup |
| `usageCount` | INT | ❌ | Número de usos |
| `lastUsedAt` | DATETIME | ✅ | Último uso |
| `notes` | TEXT | ✅ | Notas |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |
| `deletedAt` | DATETIME | ✅ | Data de exclusão (soft delete) |

**Índices**:
- `IDX_fiscal_certificate_management_establishmentId_type`
- `IDX_fiscal_certificate_management_establishmentId_operationType`
- `IDX_fiscal_certificate_management_establishmentId_isActive`


---

## BUSINESS/EXPENSES Module

### Expense
**Tabela**: `business_expenses`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `establishmentId` | UUID | ❌ | FK para Establishment |
| `category` | ENUM | ❌ | Categoria |
| `description` | VARCHAR(255) | ❌ | Descrição |
| `amount` | DECIMAL(10,2) | ❌ | Valor |
| `paymentMethod` | ENUM | ❌ | Método: CASH, CARD, PIX, BOLETO |
| `status` | ENUM | ❌ | Status: PENDING, PAID, CANCELLED |
| `expenseDate` | DATE | ❌ | Data da despesa |
| `dueDate` | DATE | ✅ | Data de vencimento |
| `paidDate` | DATE | ✅ | Data de pagamento |
| `notes` | TEXT | ✅ | Notas |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |

**Índices**:
- `IDX_EXPENSE_ESTABLISHMENT` (establishmentId)
- `IDX_EXPENSE_DATE` (expenseDate)

---

## BUSINESS/OFFERS Module

### Offer
**Tabela**: `offers`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `establishmentId` | UUID | ❌ | FK para Establishment |
| `inventoryItemId` | UUID | ❌ | FK para InventoryItem |
| `title` | VARCHAR(255) | ❌ | Título |
| `description` | TEXT | ✅ | Descrição |
| `discountType` | ENUM | ❌ | Tipo: PERCENTAGE, FIXED |
| `discountValue` | DECIMAL(10,2) | ❌ | Valor do desconto |
| `startDate` | DATE | ❌ | Data de início |
| `endDate` | DATE | ❌ | Data de término |
| `isActive` | BOOLEAN | ❌ | Ativo |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |

---

### OfferNotification
**Tabela**: `offer_notifications`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `offerId` | UUID | ❌ | FK para Offer |
| `customerId` | UUID | ❌ | FK para Customer |
| `sentAt` | TIMESTAMP | ✅ | Data de envio |
| `viewedAt` | TIMESTAMP | ✅ | Data de visualização |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |

---

## BUSINESS/SUPPLIERS Module

### Supplier
**Tabela**: `suppliers`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `establishmentId` | UUID | ❌ | FK para Establishment |
| `name` | VARCHAR(255) | ❌ | Nome |
| `cnpj` | VARCHAR(18) | ✅ | CNPJ |
| `email` | VARCHAR(255) | ✅ | Email |
| `phone` | VARCHAR(20) | ✅ | Telefone |
| `address` | TEXT | ✅ | Endereço |
| `city` | VARCHAR(100) | ✅ | Cidade |
| `state` | VARCHAR(2) | ✅ | Estado |
| `zipCode` | VARCHAR(10) | ✅ | CEP |
| `contactPerson` | VARCHAR(255) | ✅ | Pessoa de contato |
| `isActive` | BOOLEAN | ❌ | Ativo |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |

---

### PurchaseOrder
**Tabela**: `purchase_orders`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `establishmentId` | UUID | ❌ | FK para Establishment |
| `supplierId` | UUID | ❌ | FK para Supplier |
| `orderNumber` | VARCHAR(50) | ❌ | Número do pedido (unique) |
| `status` | ENUM | ❌ | Status: PENDING, CONFIRMED, RECEIVED, CANCELLED |
| `totalAmount` | DECIMAL(10,2) | ❌ | Valor total |
| `expectedDeliveryDate` | DATE | ✅ | Data esperada |
| `deliveryDate` | DATE | ✅ | Data de entrega |
| `notes` | TEXT | ✅ | Notas |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |

---

## LOGS Module

### UserLog
**Tabela**: `user_logs`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | INT | ❌ | PK (auto-increment) |
| `userId` | UUID | ❌ | FK para User |
| `action` | VARCHAR(255) | ❌ | Ação realizada |
| `resource` | VARCHAR(255) | ✅ | Recurso afetado |
| `resourceId` | VARCHAR(255) | ✅ | ID do recurso |
| `details` | JSON | ✅ | Detalhes |
| `ipAddress` | VARCHAR(45) | ✅ | Endereço IP |
| `userAgent` | TEXT | ✅ | User Agent |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |

---

## NOTIFICATIONS Module

### NotificationCampaign
**Tabela**: `notification_campaigns`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `title` | VARCHAR(255) | ❌ | Título |
| `message` | TEXT | ❌ | Mensagem |
| `targetAudience` | ENUM | ❌ | Público: ALL, USERS, BUSINESS_OWNERS |
| `status` | ENUM | ❌ | Status: DRAFT, SCHEDULED, SENT, CANCELLED |
| `scheduledFor` | TIMESTAMP | ✅ | Agendado para |
| `sentAt` | TIMESTAMP | ✅ | Enviado em |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |

---

### NotificationDelivery
**Tabela**: `notification_deliveries`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `campaignId` | UUID | ❌ | FK para NotificationCampaign |
| `userId` | UUID | ❌ | FK para User |
| `status` | ENUM | ❌ | Status: PENDING, SENT, FAILED, VIEWED |
| `sentAt` | TIMESTAMP | ✅ | Enviado em |
| `viewedAt` | TIMESTAMP | ✅ | Visualizado em |
| `failureReason` | TEXT | ✅ | Motivo da falha |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |

---

### UserPushToken
**Tabela**: `user_push_tokens`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `userId` | UUID | ❌ | FK para User |
| `token` | TEXT | ❌ | Token push |
| `platform` | ENUM | ❌ | Plataforma: IOS, ANDROID, WEB |
| `isActive` | BOOLEAN | ❌ | Ativo |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |

---

## PAYMENTS Module

### PaymentTerminalConfig
**Tabela**: `payment_terminal_configs`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `establishmentId` | UUID | ❌ | FK para Establishment |
| `terminalId` | VARCHAR(255) | ❌ | ID do terminal |
| `provider` | VARCHAR(100) | ❌ | Provedor |
| `apiKey` | TEXT | ❌ | Chave API (criptografada) |
| `isActive` | BOOLEAN | ❌ | Ativo |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |

---

## PRICES Module

### StoreLocation
**Tabela**: `store_locations`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `name` | VARCHAR(255) | ❌ | Nome |
| `latitude` | DECIMAL(10,8) | ❌ | Latitude |
| `longitude` | DECIMAL(11,8) | ❌ | Longitude |
| `city` | VARCHAR(100) | ❌ | Cidade |
| `state` | VARCHAR(2) | ❌ | Estado |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |

**Índices**:
- `IDX_store_locations_coords` (latitude, longitude)
- `IDX_store_locations_name` (name)

---

### PriceAverage
**Tabela**: `price_averages`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `storeLocationId` | UUID | ❌ | FK para StoreLocation |
| `productName` | VARCHAR(255) | ❌ | Nome do produto |
| `averagePrice` | DECIMAL(10,2) | ❌ | Preço médio |
| `minPrice` | DECIMAL(10,2) | ❌ | Preço mínimo |
| `maxPrice` | DECIMAL(10,2) | ❌ | Preço máximo |
| `sampleSize` | INT | ❌ | Quantidade de amostras |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |

**Índices**:
- `IDX_price_averages_store_product` (storeLocation, productName)
- `IDX_price_averages_product` (productName)

---

### PriceReport
**Tabela**: `price_reports`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `userId` | UUID | ❌ | FK para User |
| `storeLocationId` | UUID | ❌ | FK para StoreLocation |
| `productName` | VARCHAR(255) | ❌ | Nome do produto |
| `price` | DECIMAL(10,2) | ❌ | Preço |
| `quantity` | INT | ✅ | Quantidade |
| `unit` | VARCHAR(20) | ✅ | Unidade |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |

**Índices**:
- `IDX_price_reports_store_product_date` (storeLocation, productName, createdAt)
- `IDX_price_reports_user_date` (user, createdAt)

---

## PRODUCTS Module

### Brand
**Tabela**: `brands`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | INT | ❌ | PK (auto-increment) |
| `name` | VARCHAR(255) | ❌ | Nome |
| `logo` | VARCHAR(500) | ✅ | Logo |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |

---

## PURCHASES Module

### Purchase
**Tabela**: `purchases`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `userId` | UUID | ❌ | FK para User |
| `type` | ENUM | ❌ | Tipo: PRODUCT, SERVICE |
| `totalAmount` | DECIMAL(10,2) | ❌ | Valor total |
| `status` | ENUM | ❌ | Status: PENDING, COMPLETED, CANCELLED |
| `paymentMethod` | ENUM | ❌ | Método de pagamento |
| `purchasedAt` | TIMESTAMP | ❌ | Data da compra |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |

**Índices**:
- `IDX_purchases_user_type_purchasedAt` (user, type, purchasedAt)

---

### PurchaseItem
**Tabela**: `purchase_items`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `purchaseId` | UUID | ❌ | FK para Purchase |
| `productName` | VARCHAR(255) | ❌ | Nome do produto |
| `quantity` | INT | ❌ | Quantidade |
| `unitPrice` | DECIMAL(10,2) | ❌ | Preço unitário |
| `totalPrice` | DECIMAL(10,2) | ❌ | Preço total |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |

**Índices**:
- `IDX_purchase_items_purchase` (purchase)

---

### PurchaseInstallment
**Tabela**: `purchase_installments`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `purchaseId` | UUID | ❌ | FK para Purchase |
| `installmentNumber` | INT | ❌ | Número da parcela |
| `amount` | DECIMAL(10,2) | ❌ | Valor |
| `dueDate` | DATE | ❌ | Data de vencimento |
| `status` | ENUM | ❌ | Status: PENDING, PAID, OVERDUE |
| `paidAt` | TIMESTAMP | ✅ | Data de pagamento |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |

**Índices**:
- `IDX_purchase_installments_purchase_number` (purchase, installmentNumber)
- `IDX_purchase_installments_dueDate_status` (dueDate, status)

---

### ProductPriceHistory
**Tabela**: `product_price_history`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `userId` | UUID | ❌ | FK para User |
| `productName` | VARCHAR(255) | ❌ | Nome do produto |
| `normalizedName` | VARCHAR(255) | ❌ | Nome normalizado |
| `price` | DECIMAL(10,2) | ❌ | Preço |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |

**Índices**:
- `IDX_product_price_history_user_name` (userId, normalizedName)
- `IDX_product_price_history_name_date` (normalizedName, createdAt)

---

## REPORTS Module

### Report
**Tabela**: `reports`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `userId` | UUID | ❌ | FK para User |
| `type` | ENUM | ❌ | Tipo de relatório |
| `title` | VARCHAR(255) | ❌ | Título |
| `data` | JSON | ❌ | Dados do relatório |
| `generatedAt` | TIMESTAMP | ❌ | Data de geração |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |

---

## SHOPPING-LISTS Module

### ShoppingList
**Tabela**: `shopping_lists`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `userId` | UUID | ❌ | FK para User |
| `name` | VARCHAR(255) | ❌ | Nome |
| `description` | TEXT | ✅ | Descrição |
| `isShared` | BOOLEAN | ❌ | Compartilhada |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |

---

### ShoppingListItem
**Tabela**: `shopping_list_items`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | UUID | ❌ | PK |
| `shoppingListId` | UUID | ❌ | FK para ShoppingList |
| `productName` | VARCHAR(255) | ❌ | Nome do produto |
| `quantity` | INT | ❌ | Quantidade |
| `unit` | VARCHAR(20) | ❌ | Unidade |
| `estimatedPrice` | DECIMAL(10,2) | ✅ | Preço estimado |
| `isChecked` | BOOLEAN | ❌ | Marcado |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |

---

## TICKETS Module

### Ticket
**Tabela**: `tickets`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | INT | ❌ | PK (auto-increment) |
| `userId` | UUID | ❌ | FK para User |
| `subject` | VARCHAR(255) | ❌ | Assunto |
| `description` | TEXT | ❌ | Descrição |
| `status` | ENUM | ❌ | Status: OPEN, IN_PROGRESS, RESOLVED, CLOSED |
| `priority` | ENUM | ❌ | Prioridade: LOW, MEDIUM, HIGH, URGENT |
| `category` | VARCHAR(100) | ✅ | Categoria |
| `assignedTo` | UUID | ✅ | Atribuído a (FK para User) |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |
| `updatedAt` | TIMESTAMP | ❌ | Data de atualização |
| `resolvedAt` | TIMESTAMP | ✅ | Data de resolução |

---

### TicketMessage
**Tabela**: `ticket_messages`

| Campo | Tipo | Nullable | Descrição |
|-------|------|----------|-----------|
| `id` | INT | ❌ | PK (auto-increment) |
| `ticketId` | INT | ❌ | FK para Ticket |
| `userId` | UUID | ❌ | FK para User |
| `message` | TEXT | ❌ | Mensagem |
| `attachments` | JSON | ✅ | Anexos |
| `createdAt` | TIMESTAMP | ❌ | Data de criação |

---

## Resumo Geral

**Total de Entidades**: 51

**Distribuição por Módulo**:
- AUTH: 1
- USERS: 5
- BUSINESS/ESTABLISHMENTS: 3
- BUSINESS/CUSTOMERS: 1
- BUSINESS/INVENTORY: 2
- BUSINESS/SALES: 2
- BUSINESS/DELIVERY: 5
- BUSINESS/FISCAL: 8
- BUSINESS/EXPENSES: 1
- BUSINESS/OFFERS: 2
- BUSINESS/SUPPLIERS: 2
- LOGS: 1
- NOTIFICATIONS: 3
- PAYMENTS: 1
- PRICES: 3
- PRODUCTS: 1
- PURCHASES: 4
- REPORTS: 1
- SHOPPING-LISTS: 2
- TICKETS: 2

---

**Última atualização**: Março 2026
**Versão**: 1.0.0
