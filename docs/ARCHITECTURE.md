# Arquitetura de Microserviços

## 🏗️ Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                    Nginx (Reverse Proxy)                     │
│              (localhost:80 → serviços internos)              │
└────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
    ┌───▼────┐          ┌────▼────┐          ┌────▼────┐
    │ Monolith│          │  Sales  │          │Inventory│
    │ Core    │          │ Service │          │ Service │
    │:3000   │          │:3001   │          │:3002   │
    └────┬────┘          └────┬────┘          └────┬────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Kafka Cluster    │
                    │  (3 brokers)      │
                    │  :9092-9094       │
                    └─────────┬─────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
    ┌───▼────┐          ┌────▼────┐          ┌────▼────┐
    │Delivery │          │Suppliers│          │ Offers  │
    │Service  │          │ Service │          │ Service │
    │:3003   │          │:3004   │          │:3005   │
    └─────────┘          └─────────┘          └─────────┘

Databases:
├─ MySQL Master (Transactional) :3306
└─ Redis (Cache) :6379
```

## 📡 Serviços

### Monolith Core (3000)
- **Responsabilidade**: Autenticação, Usuários, Subscriptions
- **Banco**: MySQL Master
- **Cache**: Redis
- **Eventos**: Publica eventos de usuário

### Sales Service (3001)
- **Responsabilidade**: Vendas, POS, transações
- **Banco**: MySQL Master
- **Eventos**:
  - Publica: `sale.created`, `sale.completed`
  - Consome: Nenhum

### Inventory Service (3002)
- **Responsabilidade**: Gestão de estoque
- **Banco**: MySQL Master
- **Eventos**:
  - Publica: `inventory.stock.updated`, `inventory.low.stock.alert`
  - Consome: `sale.created`

### Delivery Service (3003)
- **Responsabilidade**: Gestão de entregas
- **Banco**: MySQL Master
- **Eventos**:
  - Publica: `delivery.order.created`, `delivery.completed`
  - Consome: `sale.created`

### Suppliers Service (3004)
- **Responsabilidade**: Gestão de fornecedores
- **Banco**: MySQL Master
- **Eventos**:
  - Publica: `supplier.purchase.order.created`
  - Consome: `inventory.low.stock.alert`

### Offers Service (3005)
- **Responsabilidade**: Promoções e descontos
- **Banco**: MySQL Master
- **Eventos**:
  - Publica: `offer.created`, `offer.activated`
  - Consome: `sale.created`

## 🔄 Fluxos de Dados

### Fluxo 1: Venda Completa

```
1. Cliente faz compra
   └→ Sales Service: POST /sales
       └→ Publica: sale.created
           ├→ Inventory Service: Consome → Atualiza estoque
           │   └→ Publica: inventory.stock.updated
           ├→ Delivery Service: Consome → Cria pedido
           │   └→ Publica: delivery.order.created
           └→ Offers Service: Consome → Valida promoções

2. Venda confirmada
   └→ Sales Service: PATCH /sales/:id/confirm
       └→ Publica: sale.confirmed
```

### Fluxo 2: Reposição de Estoque

```
1. Estoque baixo detectado
   └→ Inventory Service: Publica: inventory.low.stock.alert
       └→ Suppliers Service: Consome → Cria PO
           └→ Publica: supplier.purchase.order.created

2. Fornecedor entrega
   └→ Suppliers Service: Publica: supplier.purchase.received
       └→ Inventory Service: Consome → Atualiza estoque
```

## 📊 Kafka Topics

```
sale.created
sale.confirmed
sale.completed

inventory.stock.updated
inventory.low.stock.alert

delivery.order.created
delivery.completed

supplier.purchase.order.created
supplier.purchase.received

offer.created
offer.activated
```

## 🔐 Segurança

- JWT para autenticação
- RBAC para autorização
- Network isolation com Docker
- Variáveis sensíveis em .env

## 📈 Escalabilidade

- Cada serviço pode escalar independentemente
- Kafka garante entrega de mensagens
- Redis para cache distribuído
- MySQL com replicação para leitura

## 🔍 Monitoramento

- Prometheus para métricas
- Grafana para dashboards
- Kibana para logs
- Kafka UI para visualização de topics
