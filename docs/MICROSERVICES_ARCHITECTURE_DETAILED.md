# Arquitetura de Microserviços - SomaAI Backend com Kafka

## 📊 Análise Completa de Separação

### Estrutura Atual do Business Module

```
Business Module (Monolito)
├── Establishments (Lojas/Negócios)
├── Sales (Vendas/POS)
├── Inventory (Estoque)
├── Fiscal (NFC-e)
├── Delivery (Entregas)
├── Customers (Clientes)
├── Suppliers (Fornecedores)
├── Offers (Promoções)
├── Expenses (Despesas)
├── Reports (Relatórios)
└── Subscription (Planos)
```

### Dependências Críticas Identificadas

```
Sales ──→ Inventory (atualiza estoque)
       ├─→ Offers (aplica descontos)
       ├─→ Delivery (cria pedido de entrega)
       └─→ Fiscal (gera NFC-e)

Delivery ──→ Sales (lê dados da venda)
          ├─→ Customers (endereço)
          └─→ Establishments (zona de entrega)

Inventory ──→ Suppliers (reposição)
           └─→ Offers (estoque para promoções)

Offers ──→ Inventory (valida estoque)
        └─→ Establishments (por loja)

Suppliers ──→ Inventory (atualiza estoque)
           └─→ Establishments (por loja)
```

## 🎯 Estratégia de Separação em 3 Fases

### FASE 1: Serviços Independentes (Imediato)

#### 1️⃣ **OCR Service**
- Processamento de imagens, NFC-e, receipts
- Kafka Topics: `ocr.processing.requested` → `ocr.processing.completed`

#### 2️⃣ **Fiscal Service**
- NFC-e, XML signing, SEFAZ integration
- Kafka Topics: `fiscal.note.requested` → `fiscal.note.issued`

#### 3️⃣ **Payments Service**
- MercadoPago, processamento de pagamentos
- Kafka Topics: `payment.initiated` → `payment.completed`

### FASE 2: Serviços de Negócio (3-6 meses)

#### 4️⃣ **Sales Service** ⭐⭐⭐
- Vendas, POS, transações
- Kafka Topics: `sale.created` → `sale.confirmed` → `sale.completed`

#### 5️⃣ **Inventory Service** ⭐⭐⭐
- Gestão de estoque, movimentações
- Kafka Topics: `inventory.stock.updated`, `inventory.low.stock.alert`

#### 6️⃣ **Delivery Service** ⭐⭐⭐
- Gestão de entregas, rastreamento
- Kafka Topics: `delivery.order.created` → `delivery.completed`

#### 7️⃣ **Suppliers Service** ⭐⭐
- Gestão de fornecedores, pedidos de compra
- Kafka Topics: `supplier.purchase.order.created`

#### 8️⃣ **Offers Service** ⭐⭐
- Promoções e descontos
- Kafka Topics: `offer.created` → `offer.activated`

### FASE 3: Serviços de Suporte (6-12 meses)

#### 9️⃣ **Notifications Service** ⭐⭐
- Push, Email, SMS
- Kafka Topics: `notification.queued` → `notification.sent`

#### 🔟 **Analytics Service** ⭐
- Relatórios, trends, agregações
- Kafka Topics: `analytics.event.tracked`

## 📡 Kafka Topics Completo

```
# Sales
sale.created
sale.confirmed
sale.completed
sale.cancelled

# Inventory
inventory.stock.updated
inventory.low.stock.alert
inventory.expiring.alert

# Delivery
delivery.order.created
delivery.assigned
delivery.in_transit
delivery.completed
delivery.cancelled

# Suppliers
supplier.purchase.order.created
supplier.purchase.received

# Offers
offer.created
offer.activated
offer.expired

# Fiscal
fiscal.note.requested
fiscal.note.issued
fiscal.note.sent

# Payments
payment.initiated
payment.completed
payment.failed

# OCR
ocr.processing.requested
ocr.processing.completed

# Notifications
notification.queued
notification.sent
```

## 🔄 Fluxos de Dados com Kafka

### Fluxo 1: Venda Completa

```
1. Cliente faz compra no POS
   └─→ Sales Service: POST /sales
       └─→ Publica: sale.created
           ├─→ Inventory Service: Consome → Atualiza estoque
           ├─→ Delivery Service: Consome → Cria pedido de entrega
           └─→ Fiscal Service: Consome → Gera NFC-e

2. Pagamento confirmado
   └─→ Payments Service: Webhook MercadoPago
       └─→ Publica: payment.completed
           └─→ Sales Service: Consome → Confirma venda

3. Venda finalizada
   └─→ Sales Service: Publica: sale.completed
       ├─→ Notifications Service: Envia confirmação
       └─→ Delivery Service: Inicia entrega
```

### Fluxo 2: Reposição de Estoque

```
1. Estoque baixo detectado
   └─→ Inventory Service: Publica: inventory.low.stock.alert
       └─→ Suppliers Service: Consome → Cria PO

2. Fornecedor entrega
   └─→ Suppliers Service: Publica: supplier.purchase.received
       └─→ Inventory Service: Consome → Atualiza estoque
```

## 🏗️ Arquitetura Final com Kafka

```
┌─────────────────────────────────────────────────────────────┐
│                    Nginx (Reverse Proxy)                     │
└────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
    ┌───▼────┐          ┌────▼────┐          ┌────▼────┐
    │ Monolith│          │  Sales  │          │Inventory│
    │ Core    │          │ Service │          │ Service │
    └────┬────┘          └────┬────┘          └────┬────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Kafka Cluster    │
                    │  (3 brokers)      │
                    └─────────┬─────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
    ┌───▼────┐          ┌────▼────┐          ┌────▼────┐
    │Delivery │          │Suppliers│          │ Offers  │
    │Service  │          │ Service │          │ Service │
    └─────────┘          └─────────┘          └─────────┘
```

## 📊 Comparação: Antes vs Depois

### Antes (Monolito)
```
Problema: Uma venda dispara 5 operações síncronas
├─ Atualizar estoque (pode falhar)
├─ Validar promoção (pode falhar)
├─ Criar pedido de entrega (pode falhar)
├─ Gerar NFC-e (pode falhar)
└─ Enviar notificação (pode falhar)

Resultado: Se qualquer uma falhar, toda a venda falha
```

### Depois (Microserviços + Kafka)
```
Vantagem: Uma venda dispara eventos assíncronos
├─ Sale Service: Cria venda (rápido)
│  └─→ Publica: sale.created
│      ├─→ Inventory Service: Consome (independente)
│      ├─→ Delivery Service: Consome (independente)
│      └─→ Fiscal Service: Consome (independente)

Resultado: Venda criada mesmo se outros falharem (retry automático)
```

## 🎯 Benefícios Esperados

| Aspecto | Antes | Depois |
|--------|-------|--------|
| **Tempo de Resposta** | 2-3s | 100-200ms |
| **Escalabilidade** | Vertical | Horizontal |
| **Resiliência** | Falha em cascata | Retry automático |
| **Deployment** | Monolítico | Independente |
| **Throughput** | ~100 vendas/min | ~1000 vendas/min |
