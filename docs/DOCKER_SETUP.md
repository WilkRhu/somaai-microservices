# Setup Completo com Docker Compose + Kafka

## 🏗️ Arquitetura Simplificada

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

## 🚀 Como Rodar

```bash
# 1. Clonar repositórios
git clone <monolith-repo> services/monolith
git clone <sales-repo> services/sales
git clone <inventory-repo> services/inventory
git clone <delivery-repo> services/delivery
git clone <suppliers-repo> services/suppliers
git clone <offers-repo> services/offers

# 2. Criar arquivo .env em cada serviço
cp services/monolith/.env.example services/monolith/.env
# ... etc

# 3. Rodar tudo
docker-compose up -d

# 4. Verificar status
docker-compose ps

# 5. Ver logs
docker-compose logs -f monolith

# 6. Acessar Kafka UI
# http://localhost:8080
```

## 📊 Endpoints Disponíveis

```
Monolith (porta 3000):
  POST   /api/auth/login
  POST   /api/auth/register
  GET    /api/users/profile

Sales Service (porta 3001):
  POST   /api/sales
  GET    /api/sales/:id
  PATCH  /api/sales/:id/confirm-payment

Inventory Service (porta 3002):
  POST   /api/inventory
  GET    /api/inventory/:id
  PATCH  /api/inventory/:id/stock

Delivery Service (porta 3003):
  POST   /api/delivery/orders
  GET    /api/delivery/orders/:id
  PATCH  /api/delivery/orders/:id/status

Suppliers Service (porta 3004):
  POST   /api/suppliers
  GET    /api/suppliers/:id

Offers Service (porta 3005):
  POST   /api/offers
  GET    /api/offers/:id

Via Nginx (porta 80):
  Todos os endpoints acima via http://localhost/api/...
```

## 🔍 Monitoramento

```bash
# Ver topics Kafka
docker exec kafka-1 kafka-topics.sh --list --bootstrap-server localhost:9092

# Ver mensagens em um topic
docker exec kafka-1 kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic sale.created \
  --from-beginning

# Ver lag dos consumers
docker exec kafka-1 kafka-consumer-groups.sh \
  --bootstrap-server localhost:9092 \
  --group sales-service-group \
  --describe
```

## 🛑 Parar Tudo

```bash
docker-compose down -v  # Remove volumes também
```
