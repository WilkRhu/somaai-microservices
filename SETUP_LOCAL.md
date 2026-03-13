# Setup Local - Rodar Tudo Localmente

## Pré-requisitos

Você precisa ter instalado:
- Node.js 18+
- npm ou yarn
- MySQL 8.0
- Redis 7
- Kafka (opcional, mas recomendado)

## Passo 1: Instalar Dependências

Execute este comando para instalar as dependências de todos os serviços:

```bash
# Windows (PowerShell)
.\scripts\install-all-deps.ps1

# Linux/Mac
bash scripts/install-all-deps.sh
```

Ou instale manualmente em cada serviço:

```bash
cd services/auth && npm install --legacy-peer-deps && cd ../..
cd services/business && npm install --legacy-peer-deps && cd ../..
cd services/sales && npm install --legacy-peer-deps && cd ../..
cd services/inventory && npm install --legacy-peer-deps && cd ../..
cd services/delivery && npm install --legacy-peer-deps && cd ../..
cd services/suppliers && npm install --legacy-peer-deps && cd ../..
cd services/offers && npm install --legacy-peer-deps && cd ../..
cd services/fiscal && npm install --legacy-peer-deps && cd ../..
cd services/ocr && npm install --legacy-peer-deps && cd ../..
cd services/payments && npm install --legacy-peer-deps && cd ../..
cd services/monolith && npm install --legacy-peer-deps && cd ../..
cd services/orchestrator && npm install --legacy-peer-deps && cd ../..
```

## Passo 2: Configurar Banco de Dados

### MySQL

```bash
# Criar banco de dados
mysql -u root -p -e "CREATE DATABASE somaai_master;"
mysql -u root -p -e "CREATE USER 'somaai'@'localhost' IDENTIFIED BY 'somaai_password';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON somaai_master.* TO 'somaai'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"
```

### Redis

```bash
# Iniciar Redis (já deve estar rodando)
redis-server
```

### Kafka (Opcional)

```bash
# Se quiser usar Kafka, inicie o Zookeeper e Kafka
# Ou use Docker Compose apenas para infraestrutura:
docker-compose up -d zookeeper kafka-1 kafka-2 kafka-3 mysql-master redis
```

## Passo 3: Rodar os Serviços

### Opção 1: Rodar Todos em Paralelo (Recomendado)

Abra múltiplos terminais e execute em cada um:

```bash
# Terminal 1 - Auth
cd services/auth && npm run start:dev

# Terminal 2 - Orchestrator
cd services/orchestrator && npm run start:dev

# Terminal 3 - Business
cd services/business && npm run start:dev

# Terminal 4 - Sales
cd services/sales && npm run start:dev

# Terminal 5 - Inventory
cd services/inventory && npm run start:dev

# Terminal 6 - Delivery
cd services/delivery && npm run start:dev

# Terminal 7 - Suppliers
cd services/suppliers && npm run start:dev

# Terminal 8 - Offers
cd services/offers && npm run start:dev

# Terminal 9 - Fiscal
cd services/fiscal && npm run start:dev

# Terminal 10 - OCR
cd services/ocr && npm run start:dev

# Terminal 11 - Payments
cd services/payments && npm run start:dev

# Terminal 12 - Monolith
cd services/monolith && npm run start:dev
```

### Opção 2: Rodar com Script (Windows)

```bash
.\scripts\run-all-local.ps1
```

### Opção 3: Rodar Serviços Individuais

```bash
# Rodar apenas um serviço
cd services/auth
npm run start:dev
```

## Passo 4: Verificar Status

Abra seu navegador e acesse:

- Auth: http://localhost:3000/api/docs
- Orchestrator: http://localhost:3009/api/docs
- Business: http://localhost:3011/api/docs
- Sales: http://localhost:3001/api/docs
- Inventory: http://localhost:3002/api/docs
- Delivery: http://localhost:3003/api/docs
- Suppliers: http://localhost:3004/api/docs
- Offers: http://localhost:3005/api/docs
- Fiscal: http://localhost:3006/api/docs
- OCR: http://localhost:3007/api/docs
- Payments: http://localhost:3008/api/docs
- Monolith: http://localhost:3010/api/docs

## Passo 5: Testar Endpoints

```bash
# Testar Auth
curl http://localhost:3000/health

# Testar Orchestrator
curl http://localhost:3009/health

# Criar usuário
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Troubleshooting

### Erro: "Cannot find module"

```bash
# Reinstalar dependências
npm install --legacy-peer-deps
```

### Erro: "Connection refused"

Verifique se MySQL, Redis e Kafka estão rodando:

```bash
# MySQL
mysql -u somaai -p somaai_password -e "SELECT 1"

# Redis
redis-cli ping

# Kafka
kafka-broker-api-versions.sh --bootstrap-server localhost:9092
```

### Erro: "Port already in use"

Mude a porta no arquivo `.env` de cada serviço ou mate o processo:

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

## Próximos Passos

1. ✅ Instalar dependências
2. ✅ Configurar banco de dados
3. ✅ Rodar serviços
4. ✅ Testar endpoints
5. Implementar testes de integração
6. Implementar testes E2E
7. Configurar CI/CD

## Documentação

- [README.md](README.md) - Documentação geral
- [docker-compose.yml](docker-compose.yml) - Configuração Docker
- [.env.example](.env.example) - Variáveis de ambiente

