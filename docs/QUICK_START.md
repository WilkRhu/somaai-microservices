# Quick Start - SomaAI Microservices

## ⚡ 5 Minutos para Começar

### 1️⃣ Pré-requisitos

```bash
# Verificar Docker
docker --version
docker-compose --version

# Deve retornar versões (ex: Docker 24.0.0, Docker Compose 2.20.0)
```

### 2️⃣ Clone e Configure

```bash
# Clone
git clone <repo> somaai-microservices
cd somaai-microservices

# Configure
cp .env.example .env
```

### 3️⃣ Inicie

```bash
# Torne scripts executáveis
chmod +x scripts/*.sh

# Inicie
./scripts/start.sh
```

### 4️⃣ Verifique

```bash
# Aguarde ~30 segundos
./scripts/health-check.sh

# Deve mostrar ✅ para todos os serviços
```

### 5️⃣ Acesse

```
🌐 Nginx (API Gateway):     http://localhost
📊 Kafka UI:                http://localhost:8080
📈 Prometheus:              http://localhost:9090
📉 Grafana:                 http://localhost:3100
```

## 🧪 Testar Fluxo de Venda

### 1. Criar Venda

```bash
curl -X POST http://localhost/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "establishmentId": "est-123",
    "items": [
      {
        "productId": "prod-1",
        "productName": "Produto A",
        "unitPrice": 50.00,
        "quantity": 2
      }
    ]
  }'
```

### 2. Ver Eventos no Kafka

```bash
# Abra http://localhost:8080
# Clique em "Topics"
# Procure por "sale.created"
# Veja as mensagens
```

### 3. Verificar Estoque Atualizado

```bash
curl http://localhost/api/inventory/establishment/est-123
```

## 📊 Dashboards

### Kafka UI (http://localhost:8080)
- Ver topics
- Ver mensagens
- Ver consumer groups
- Ver lag

### Prometheus (http://localhost:9090)
- Métricas de CPU, memória
- Requisições HTTP
- Latência de banco de dados

### Grafana (http://localhost:3100)
- Dashboards customizados
- Alertas
- Login: admin/admin

## 🛑 Parar Tudo

```bash
./scripts/stop.sh
```

## 📝 Logs

```bash
# Todos os logs
./scripts/logs.sh

# Logs de um serviço
./scripts/logs.sh sales-service

# Últimas 50 linhas
docker-compose logs --tail=50 sales-service
```

## 🔧 Troubleshooting Rápido

### Serviço não inicia?
```bash
docker-compose logs sales-service
docker-compose up -d --build sales-service
```

### Kafka não conecta?
```bash
docker-compose restart kafka-1 kafka-2 kafka-3
```

### Database error?
```bash
docker-compose restart mysql-master
```

### Tudo quebrado?
```bash
docker-compose down -v
./scripts/start.sh
```

## 📚 Próximos Passos

1. Leia [ARCHITECTURE.md](docs/ARCHITECTURE.md)
2. Explore [KAFKA_GUIDE.md](docs/KAFKA_GUIDE.md)
3. Consulte [DEPLOYMENT.md](docs/DEPLOYMENT.md)
4. Resolva problemas em [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

## 🎯 Endpoints Principais

```
POST   /api/sales                    # Criar venda
GET    /api/sales/:id                # Obter venda
PATCH  /api/sales/:id/confirm        # Confirmar venda

POST   /api/inventory                # Adicionar item
GET    /api/inventory/:id            # Obter item
PATCH  /api/inventory/:id/stock      # Atualizar estoque

POST   /api/delivery/orders          # Criar entrega
GET    /api/delivery/orders/:id      # Obter entrega
PATCH  /api/delivery/orders/:id/status # Atualizar status

POST   /api/suppliers                # Criar fornecedor
POST   /api/suppliers/:id/purchase-orders # Criar PO

POST   /api/offers                   # Criar promoção
GET    /api/offers/:id               # Obter promoção
```

## 💡 Dicas

- Use `docker-compose logs -f` para debug em tempo real
- Acesse Kafka UI para visualizar fluxo de eventos
- Use Grafana para monitorar performance
- Consulte documentação antes de fazer mudanças

## ❓ Dúvidas?

Consulte a documentação em `docs/` ou execute:

```bash
./scripts/health-check.sh
```

Boa sorte! 🚀
