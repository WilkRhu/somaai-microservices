# Deployment

## 🚀 Quick Start

```bash
# 1. Clone
git clone <repo> somaai-microservices
cd somaai-microservices

# 2. Configure
cp .env.example .env

# 3. Inicie
./scripts/start.sh

# 4. Verifique
./scripts/health-check.sh
```

## 📦 Estrutura de Pastas

```
somaai-microservices/
├── docker-compose.yml
├── .env.example
├── nginx/
├── scripts/
├── docs/
└── services/
    ├── monolith/
    ├── sales/
    ├── inventory/
    ├── delivery/
    ├── suppliers/
    └── offers/
```

## 🐳 Docker Compose

```bash
# Build
docker-compose build

# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f sales-service
```

## 📊 Acessar Serviços

| Serviço | URL |
|---------|-----|
| Nginx | http://localhost |
| Kafka UI | http://localhost:8080 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3100 |

## 🔄 Atualizar Serviço

```bash
# Rebuild e restart
docker-compose up -d --build sales-service

# Ou
docker-compose restart sales-service
```

## 📝 Logs

```bash
# Todos
docker-compose logs -f

# Um serviço
docker-compose logs -f sales-service

# Últimas 100 linhas
docker-compose logs --tail=100 sales-service
```

## 🛑 Parar Tudo

```bash
docker-compose down -v  # Remove volumes também
```
