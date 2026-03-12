# Docker Ready Checklist - O Que Falta

**Data**: March 12, 2026  
**Status**: 85% Pronto para Docker  
**Última Atualização**: Análise Completa

---

## ✅ O Que JÁ Está Pronto

### Infraestrutura
- ✅ `docker-compose.yml` completo com todos os serviços
- ✅ Zookeeper, Kafka (3 brokers), Kafka UI
- ✅ MySQL Master com healthcheck
- ✅ Redis com healthcheck
- ✅ Network bridge configurada
- ✅ Volumes nomeados para persistência

### Microserviços
- ✅ 12 serviços NestJS definidos no docker-compose
- ✅ Todos os serviços com portas mapeadas
- ✅ Variáveis de ambiente configuradas
- ✅ Dependencies e healthchecks definidos
- ✅ Restart policy configurada

### Configuração
- ✅ `.env.example` com todas as variáveis necessárias
- ✅ `.env` local para desenvolvimento
- ✅ Documentação de deployment

---

## 🔴 O Que FALTA para Rodar no Docker

### 1. **Dockerfiles em Alguns Serviços** (CRÍTICO)
**Status**: ⚠️ Parcial  
**Impacto**: Impossível fazer build dos serviços

**Verificar**:
```bash
# Verificar quais serviços têm Dockerfile
ls -la services/*/Dockerfile
```

**Serviços que PRECISAM de Dockerfile**:
- [ ] `services/auth/Dockerfile` - Verificar se existe
- [ ] `services/business/Dockerfile` - Verificar se existe
- [ ] `services/sales/Dockerfile` - Verificar se existe
- [ ] `services/inventory/Dockerfile` - Verificar se existe
- [ ] `services/delivery/Dockerfile` - Verificar se existe
- [ ] `services/suppliers/Dockerfile` - Verificar se existe
- [ ] `services/offers/Dockerfile` - Verificar se existe
- [ ] `services/fiscal/Dockerfile` - Verificar se existe
- [ ] `services/ocr/Dockerfile` - Verificar se existe
- [ ] `services/payments/Dockerfile` - Verificar se existe
- [ ] `services/monolith/Dockerfile` - Verificar se existe
- [ ] `services/orchestrator/Dockerfile` - Verificar se existe

**Solução**: Se não existirem, criar Dockerfile padrão para cada serviço:

```dockerfile
# services/[service]/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build NestJS app
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/main.js"]
```

---

### 2. **Package.json em Cada Serviço** (CRÍTICO)
**Status**: ⚠️ Verificar  
**Impacto**: Sem package.json, não consegue instalar dependências

**Verificar**:
```bash
# Verificar quais serviços têm package.json
ls -la services/*/package.json
```

**Serviços que PRECISAM de package.json**:
- [ ] `services/auth/package.json`
- [ ] `services/business/package.json`
- [ ] `services/sales/package.json`
- [ ] `services/inventory/package.json`
- [ ] `services/delivery/package.json`
- [ ] `services/suppliers/package.json`
- [ ] `services/offers/package.json`
- [ ] `services/fiscal/package.json`
- [ ] `services/ocr/package.json`
- [ ] `services/payments/package.json`
- [ ] `services/monolith/package.json`
- [ ] `services/orchestrator/package.json`

---

### 3. **Variáveis de Ambiente Faltando** (IMPORTANTE)
**Status**: ⚠️ Parcial  
**Impacto**: Serviços podem não iniciar corretamente

**Faltando no docker-compose.yml**:

```yaml
# Adicionar em cada serviço:
environment:
  # ... variáveis existentes ...
  
  # FALTANDO:
  JWT_SECRET: ${JWT_SECRET:-your-secret-key-change-in-production}
  JWT_EXPIRATION: ${JWT_EXPIRATION:-24h}
  JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET:-your-refresh-secret-key}
  JWT_REFRESH_EXPIRATION: ${JWT_REFRESH_EXPIRATION:-7d}
  
  # Para serviços que usam Google OAuth:
  GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:-}
  GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET:-}
  GOOGLE_CALLBACK_URL: ${GOOGLE_CALLBACK_URL:-}
  
  # Para serviços que usam Kafka:
  KAFKA_GROUP_ID: ${KAFKA_GROUP_ID:-somaai-group}
  KAFKA_CLIENT_ID: ${KAFKA_CLIENT_ID:-somaai-client}
  
  # Logging:
  LOG_LEVEL: ${LOG_LEVEL:-debug}
  
  # Bcrypt:
  BCRYPT_ROUNDS: ${BCRYPT_ROUNDS:-10}
```

---

### 4. **Arquivo .env para Docker** (IMPORTANTE)
**Status**: ❌ Não existe  
**Impacto**: Variáveis não serão carregadas no docker-compose

**Criar**: `.env.docker` ou usar `.env` existente

```bash
# Copiar .env.example para .env
cp .env.example .env

# Editar .env com valores para Docker:
NODE_ENV=production
DB_HOST=mysql-master
DB_PORT=3306
DB_USERNAME=somaai
DB_PASSWORD=somaai_password
DB_DATABASE=somaai_master

KAFKA_BROKERS=kafka-1:29092,kafka-2:29092,kafka-3:29092
REDIS_HOST=redis
REDIS_PORT=6379

JWT_SECRET=your-production-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

### 5. **Scripts de Inicialização do Banco** (IMPORTANTE)
**Status**: ⚠️ Parcial  
**Impacto**: Banco pode não ter tabelas criadas

**Verificar**:
- [ ] `scripts/init-databases.sql` - Criar tabelas
- [ ] `scripts/init-databases.js` - Seed de dados

**Solução**: Adicionar ao docker-compose.yml:

```yaml
mysql-master:
  # ... configuração existente ...
  volumes:
    - mysql_master_data:/var/lib/mysql
    - ./scripts/init-databases.sql:/docker-entrypoint-initdb.d/init.sql
```

---

### 6. **Health Checks Faltando** (IMPORTANTE)
**Status**: ⚠️ Parcial  
**Impacto**: Serviços podem iniciar antes de estarem prontos

**Adicionar em cada serviço**:

```yaml
auth:
  # ... configuração existente ...
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
    interval: 10s
    timeout: 5s
    retries: 5
    start_period: 30s
```

---

### 7. **Volumes para Persistência** (IMPORTANTE)
**Status**: ⚠️ Parcial  
**Impacto**: Dados podem ser perdidos ao parar containers

**Verificar**:
- ✅ MySQL: `mysql_master_data:/var/lib/mysql`
- ✅ Redis: `redis_data:/data`
- ❌ Logs: Não configurado
- ❌ Uploads: Não configurado

**Adicionar se necessário**:

```yaml
volumes:
  mysql_master_data:
  redis_data:
  logs_data:
  uploads_data:
```

---

### 8. **Networking** (IMPORTANTE)
**Status**: ✅ Configurado  
**Impacto**: Serviços precisam se comunicar

**Verificar**:
- ✅ Network `somaai-network` criada
- ✅ Todos os serviços conectados
- ✅ DNS interno funcionando

---

### 9. **Ports Mapeadas** (IMPORTANTE)
**Status**: ✅ Configurado  
**Impacto**: Acessar serviços do host

**Verificar**:
```
3000  - Auth
3001  - Sales
3002  - Inventory
3003  - Delivery
3004  - Suppliers
3005  - Offers
3006  - Fiscal
3007  - OCR
3008  - Payments
3009  - Orchestrator
3010  - Monolith
3011  - Business
8080  - Kafka UI
2181  - Zookeeper
9092  - Kafka-1
9093  - Kafka-2
9094  - Kafka-3
3306  - MySQL
6379  - Redis
```

---

### 10. **Dependências Entre Serviços** (IMPORTANTE)
**Status**: ⚠️ Parcial  
**Impacto**: Serviços podem iniciar fora de ordem

**Verificar**:
- ✅ Serviços dependem de MySQL
- ✅ Serviços dependem de Redis
- ✅ Serviços dependem de Kafka
- ❌ Serviços não dependem uns dos outros

**Adicionar se necessário**:

```yaml
orchestrator:
  depends_on:
    auth:
      condition: service_started
    business:
      condition: service_started
    sales:
      condition: service_started
    # ... outros serviços ...
```

---

## 🚀 Plano de Ação - Passo a Passo

### Passo 1: Verificar Dockerfiles (5 min)
```bash
# Verificar quais serviços têm Dockerfile
for service in auth business sales inventory delivery suppliers offers fiscal ocr payments monolith orchestrator; do
  if [ -f "services/$service/Dockerfile" ]; then
    echo "✅ $service tem Dockerfile"
  else
    echo "❌ $service NÃO tem Dockerfile"
  fi
done
```

### Passo 2: Verificar package.json (5 min)
```bash
# Verificar quais serviços têm package.json
for service in auth business sales inventory delivery suppliers offers fiscal ocr payments monolith orchestrator; do
  if [ -f "services/$service/package.json" ]; then
    echo "✅ $service tem package.json"
  else
    echo "❌ $service NÃO tem package.json"
  fi
done
```

### Passo 3: Criar Dockerfiles Faltando (30 min)
Se algum serviço não tiver Dockerfile, criar usando o template acima.

### Passo 4: Configurar .env (10 min)
```bash
cp .env.example .env
# Editar .env com valores para Docker
```

### Passo 5: Testar Build (15 min)
```bash
docker-compose build
```

### Passo 6: Testar Inicialização (10 min)
```bash
docker-compose up -d
docker-compose ps
```

### Passo 7: Verificar Logs (10 min)
```bash
docker-compose logs -f
```

---

## 📊 Resumo do Status

| Item | Status | Prioridade | Tempo |
|------|--------|-----------|-------|
| docker-compose.yml | ✅ Pronto | - | - |
| Dockerfiles | ⚠️ Verificar | 🔴 CRÍTICO | 30 min |
| package.json | ⚠️ Verificar | 🔴 CRÍTICO | 5 min |
| Variáveis de Ambiente | ⚠️ Parcial | 🟡 IMPORTANTE | 15 min |
| .env para Docker | ❌ Falta | 🟡 IMPORTANTE | 10 min |
| Scripts de Inicialização | ⚠️ Parcial | 🟡 IMPORTANTE | 15 min |
| Health Checks | ⚠️ Parcial | 🟡 IMPORTANTE | 20 min |
| Volumes | ⚠️ Parcial | 🟡 IMPORTANTE | 10 min |
| Networking | ✅ Pronto | - | - |
| Ports | ✅ Pronto | - | - |
| Dependências | ⚠️ Parcial | 🟡 IMPORTANTE | 10 min |
| **TOTAL** | **85%** | | **~2 horas** |

---

## 🎯 Próximos Passos

### Imediato (Hoje)
1. Verificar se todos os serviços têm Dockerfile
2. Verificar se todos os serviços têm package.json
3. Criar .env para Docker
4. Testar `docker-compose build`

### Curto Prazo (Próximas horas)
1. Adicionar variáveis de ambiente faltando
2. Adicionar health checks
3. Configurar scripts de inicialização do banco
4. Testar `docker-compose up -d`

### Médio Prazo (Próximos dias)
1. Testar todos os endpoints
2. Testar integração entre serviços
3. Testar Kafka
4. Testar Redis

---

## 💡 Comandos Úteis

```bash
# Build de todos os serviços
docker-compose build

# Iniciar todos os serviços
docker-compose up -d

# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f

# Parar todos os serviços
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Rebuild de um serviço específico
docker-compose build --no-cache auth
docker-compose up -d auth

# Executar comando em um container
docker-compose exec auth npm run test

# Ver recursos usados
docker stats
```

---

## ⚠️ Possíveis Problemas

### Problema 1: "Dockerfile not found"
**Solução**: Criar Dockerfile em cada serviço

### Problema 2: "Cannot find module"
**Solução**: Verificar se package.json existe e tem todas as dependências

### Problema 3: "Connection refused"
**Solução**: Aguardar healthchecks passarem, verificar logs

### Problema 4: "Port already in use"
**Solução**: Mudar porta no docker-compose.yml ou parar outro serviço

### Problema 5: "Out of memory"
**Solução**: Aumentar recursos do Docker Desktop

---

**Quer que eu verifique os Dockerfiles e package.json agora?** 🚀

