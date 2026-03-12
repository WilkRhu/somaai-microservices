# SomaAI Microservices Architecture

Arquitetura de microserviços com Kafka para o projeto SomaAI.

## 🏗️ Estrutura do Projeto

```
somaai-microservices/
├── docker-compose.yml          # Orquestração de containers
├── .env.example                # Variáveis de ambiente
├── README.md                   # Este arquivo
├── docs/                       # Documentação
│   ├── ARCHITECTURE.md
│   ├── KAFKA_GUIDE.md
│   ├── DEPLOYMENT.md
│   └── TROUBLESHOOTING.md
├── nginx/                      # Configuração Nginx
│   ├── nginx.conf
│   └── conf.d/
│       └── default.conf
├── mysql/                      # Configuração MySQL
│   ├── master.cnf
│   └── replica.cnf
├── prometheus/                 # Monitoramento
│   ├── prometheus.yml
│   └── alerting-rules.yml
├── logstash/                   # Logging
│   └── logstash.conf
├── services/                   # Microserviços
│   ├── monolith/              # Core (Auth, Users, Subscriptions)
│   ├── sales/                 # Sales Service
│   ├── inventory/             # Inventory Service
│   ├── delivery/              # Delivery Service
│   ├── suppliers/             # Suppliers Service
│   └── offers/                # Offers Service
└── scripts/                    # Scripts úteis
    ├── setup.sh
    ├── start.sh
    ├── stop.sh
    ├── logs.sh
    └── health-check.sh
```

## 🚀 Quick Start

```bash
# 1. Clone este repositório
git clone <repo> somaai-microservices
cd somaai-microservices

# 2. Configure variáveis de ambiente
cp .env.example .env

# 3. Inicie os serviços
./scripts/start.sh

# 4. Verifique saúde
./scripts/health-check.sh

# 5. Acesse os serviços
# Nginx: http://localhost
# Kafka UI: http://localhost:8080
# Grafana: http://localhost:3100
# Kibana: http://localhost:5601
```

## 📡 Serviços Disponíveis

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| Nginx | 80 | Reverse Proxy |
| Monolith | 3000 | Core (Auth, Users) |
| Sales | 3001 | Vendas/POS |
| Inventory | 3002 | Estoque |
| Delivery | 3003 | Entregas |
| Suppliers | 3004 | Fornecedores |
| Offers | 3005 | Promoções |
| Kafka UI | 8080 | Visualização Kafka |
| Prometheus | 9090 | Métricas |
| Grafana | 3100 | Dashboards |
| Kibana | 5601 | Logs |

## 🔄 Fluxo de Venda

```
Cliente compra
    ↓
Sales Service cria venda
    ↓
Publica: sale.created
    ├→ Inventory Service: atualiza estoque
    ├→ Delivery Service: cria pedido de entrega
    ├→ Fiscal Service: gera NFC-e
    └→ Offers Service: valida promoções
```

## 📚 Documentação

- [Arquitetura](docs/ARCHITECTURE.md)
- [Guia Kafka](docs/KAFKA_GUIDE.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## 🛠️ Desenvolvimento

### Adicionar novo serviço

```bash
# 1. Criar pasta
mkdir services/novo-servico

# 2. Copiar template
cp services/sales/* services/novo-servico/

# 3. Atualizar docker-compose.yml
# 4. Atualizar nginx.conf
# 5. Rodar: docker-compose up -d novo-servico
```

### Testar evento Kafka

```bash
# Ver topics
docker exec kafka-1 kafka-topics.sh --list --bootstrap-server localhost:9092

# Consumir mensagens
docker exec kafka-1 kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic sale.created \
  --from-beginning
```

## 📊 Monitoramento

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3100 (admin/admin)
- **Kibana**: http://localhost:5601
- **Kafka UI**: http://localhost:8080

## 🔐 Segurança

- Variáveis sensíveis em `.env` (não commitar)
- JWT para autenticação entre serviços
- TLS para Kafka em produção
- Network isolation com Docker

## 📝 Logs

```bash
# Ver logs de um serviço
docker-compose logs -f sales-service

# Ver logs de todos
docker-compose logs -f

# Últimas 100 linhas
docker-compose logs --tail=100 sales-service
```

## 🆘 Troubleshooting

```bash
# Verificar saúde
./scripts/health-check.sh

# Reiniciar um serviço
docker-compose restart sales-service

# Rebuild
docker-compose up -d --build sales-service

# Ver detalhes de erro
docker-compose logs sales-service | grep ERROR
```

## 📞 Suporte

Para dúvidas ou problemas, consulte a [documentação de troubleshooting](docs/TROUBLESHOOTING.md).

## 📄 Licença

Proprietary - SomaAI
