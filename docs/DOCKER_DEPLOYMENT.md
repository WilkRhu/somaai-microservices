# Docker Deployment Guide

## Overview

Toda a aplicação SomaAI agora pode ser iniciada com um único comando Docker Compose. Isso inclui:

- **Infraestrutura**: Kafka (3 brokers), Zookeeper, MySQL, Redis
- **Microserviços**: 12 serviços NestJS (Auth, Orchestrator, Business, Sales, Inventory, Delivery, Suppliers, Offers, Fiscal, OCR, Payments, Monolith)

## Prerequisites

- Docker Desktop instalado e rodando
- Docker Compose v2.0+
- Mínimo 8GB de RAM disponível
- Mínimo 20GB de espaço em disco

## Quick Start

### 1. Build e Start de Todos os Serviços

```bash
docker-compose up -d
```

Isso vai:
- Fazer build de todos os 12 serviços NestJS
- Iniciar a infraestrutura (Kafka, MySQL, Redis)
- Iniciar todos os microserviços
- Configurar networking entre containers

### 2. Verificar Status

```bash
docker-compose ps
```

Você deve ver algo como:

```
NAME                    STATUS
zookeeper              Up (healthy)
kafka-1                Up (healthy)
kafka-2                Up (healthy)
kafka-3                Up (healthy)
kafka-ui               Up
mysql-master           Up (healthy)
redis                  Up (healthy)
auth-service           Up
orchestrator-service   Up
business-service       Up
sales-service          Up
inventory-service      Up
delivery-service       Up
suppliers-service      Up
offers-service         Up
fiscal-service         Up
ocr-service            Up
payments-service       Up
monolith-service       Up
```

### 3. Acessar os Serviços

| Serviço | URL | Porta |
|---------|-----|-------|
| Orchestrator | http://localhost:3009 | 3009 |
| Auth | http://localhost:3000 | 3000 |
| Monolith | http://localhost:3010 | 3010 |
| Business | http://localhost:3011 | 3011 |
| Sales | http://localhost:3001 | 3001 |
| Inventory | http://localhost:3002 | 3002 |
| Delivery | http://localhost:3003 | 3003 |
| Suppliers | http://localhost:3004 | 3004 |
| Offers | http://localhost:3005 | 3005 |
| Fiscal | http://localhost:3006 | 3006 |
| OCR | http://localhost:3007 | 3007 |
| Payments | http://localhost:3008 | 3008 |
| Kafka UI | http://localhost:8080 | 8080 |

### 4. Verificar Logs

```bash
# Todos os serviços
docker-compose logs -f

# Serviço específico
docker-compose logs -f orchestrator

# Últimas 100 linhas
docker-compose logs --tail=100 orchestrator
```

### 5. Parar Todos os Serviços

```bash
docker-compose down
```

### 6. Parar e Remover Volumes (Reset Completo)

```bash
docker-compose down -v
```

## Troubleshooting

### Serviço não inicia

1. Verificar logs:
```bash
docker-compose logs orchestrator
```

2. Verificar se a porta está em uso:
```bash
netstat -ano | findstr :3009
```

3. Rebuild do serviço:
```bash
docker-compose build --no-cache orchestrator
docker-compose up -d orchestrator
```

### Erro de conexão com banco de dados

Aguarde alguns segundos para o MySQL ficar pronto. Os serviços têm retry automático.

```bash
docker-compose logs mysql-master
```

### Erro de conexão com Kafka

Verifique se o Kafka está saudável:

```bash
docker-compose logs kafka-1
```

### Limpar tudo e recomeçar

```bash
docker-compose down -v
docker system prune -a
docker-compose up -d
```

## Development

### Rebuild de um serviço específico

```bash
docker-compose build --no-cache orchestrator
docker-compose up -d orchestrator
```

### Rebuild de todos os serviços

```bash
docker-compose build --no-cache
docker-compose up -d
```

### Executar comando em um container

```bash
docker-compose exec orchestrator npm run test
```

## Environment Variables

Todos os serviços usam as seguintes variáveis (definidas no docker-compose.yml):

- `NODE_ENV`: production
- `DATABASE_URL`: mysql://somaai:somaai_password@mysql-master:3306/somaai_master
- `REDIS_URL`: redis://redis:6379
- `KAFKA_BROKERS`: kafka-1:29092,kafka-2:29092,kafka-3:29092
- `PORT`: Específica de cada serviço

Para customizar, edite o `docker-compose.yml` na seção `environment` de cada serviço.

## Performance Tips

1. **Aumentar recursos do Docker**: Vá em Docker Desktop → Settings → Resources
   - CPUs: 4+
   - Memory: 8GB+

2. **Usar volumes nomeados**: Já configurado para MySQL e Redis

3. **Monitorar recursos**:
```bash
docker stats
```

## Production Considerations

Para produção, considere:

1. Usar secrets ao invés de variáveis de ambiente
2. Configurar proper logging (ELK stack, etc)
3. Usar load balancer (nginx, traefik)
4. Configurar backup automático do MySQL
5. Usar managed services (RDS, ElastiCache, MSK)
6. Implementar CI/CD pipeline

## Next Steps

- Verificar logs de cada serviço
- Testar endpoints via Postman
- Configurar monitoramento (Prometheus, Grafana)
- Implementar health checks customizados
