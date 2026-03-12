# Estrutura do Projeto somaai-microservices

## 📁 Árvore de Diretórios

```
somaai-microservices/
│
├── 📄 README.md                    # Documentação principal
├── 📄 STRUCTURE.md                 # Este arquivo
├── 📄 docker-compose.yml           # Orquestração de containers
├── 📄 .env.example                 # Variáveis de ambiente
├── 📄 .gitignore                   # Git ignore
│
├── 📁 docs/                        # Documentação
│   ├── ARCHITECTURE.md             # Arquitetura de microserviços
│   ├── KAFKA_GUIDE.md              # Guia de uso do Kafka
│   ├── DEPLOYMENT.md               # Guia de deployment
│   └── TROUBLESHOOTING.md          # Troubleshooting
│
├── 📁 nginx/                       # Configuração Nginx
│   ├── nginx.conf                  # Configuração principal
│   └── conf.d/                     # Configurações adicionais
│
├── 📁 scripts/                     # Scripts úteis
│   ├── start.sh                    # Inicia os serviços
│   ├── stop.sh                     # Para os serviços
│   ├── health-check.sh             # Verifica saúde
│   └── logs.sh                     # Ver logs
│
├── 📁 services/                    # Microserviços
│   ├── monolith/                   # Core (Auth, Users, Subscriptions)
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── .env.example
│   │
│   ├── sales/                      # Sales Service
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── .env.example
│   │
│   ├── inventory/                  # Inventory Service
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── .env.example
│   │
│   ├── delivery/                   # Delivery Service
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── .env.example
│   │
│   ├── suppliers/                  # Suppliers Service
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── .env.example
│   │
│   └── offers/                     # Offers Service
│       ├── src/
│       ├── Dockerfile
│       ├── package.json
│       └── .env.example
│
└── 📁 config/                      # Configurações (opcional)
    ├── prometheus.yml              # Prometheus config
    ├── alerting-rules.yml          # Alertas
    └── logstash.conf               # Logstash config
```

## 🚀 Como Usar

### 1. Setup Inicial

```bash
# Clone o repositório
git clone <repo> somaai-microservices
cd somaai-microservices

# Configure variáveis de ambiente
cp .env.example .env

# Inicie os serviços
./scripts/start.sh
```

### 2. Verificar Status

```bash
# Verificar saúde de todos os serviços
./scripts/health-check.sh

# Ver logs
./scripts/logs.sh

# Ver logs de um serviço específico
./scripts/logs.sh sales-service
```

### 3. Acessar Serviços

- **API Gateway**: http://localhost
- **Kafka UI**: http://localhost:8080
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3100

### 4. Parar Serviços

```bash
./scripts/stop.sh
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

## 🔄 Fluxo de Venda

```
Cliente compra
    ↓
Sales Service cria venda
    ↓
Publica: sale.created
    ├→ Inventory Service: atualiza estoque
    ├→ Delivery Service: cria pedido de entrega
    ├→ Offers Service: valida promoções
    └→ Notificações enviadas
```

## 📚 Documentação

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Arquitetura detalhada
- **[KAFKA_GUIDE.md](docs/KAFKA_GUIDE.md)** - Como usar Kafka
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Guia de deployment
- **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Solução de problemas

## 🛠️ Adicionar Novo Serviço

1. Criar pasta em `services/novo-servico`
2. Copiar estrutura de um serviço existente
3. Atualizar `docker-compose.yml`
4. Atualizar `nginx/nginx.conf`
5. Rodar: `docker-compose up -d novo-servico`

## 🔐 Segurança

- Variáveis sensíveis em `.env` (não commitar)
- JWT para autenticação entre serviços
- Network isolation com Docker
- TLS para Kafka em produção

## 📊 Monitoramento

- **Prometheus**: Coleta de métricas
- **Grafana**: Dashboards
- **Kafka UI**: Visualização de topics
- **Logs**: Centralizados em cada serviço

## 🆘 Suporte

Consulte [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) para problemas comuns.

## 📄 Licença

Proprietary - SomaAI
