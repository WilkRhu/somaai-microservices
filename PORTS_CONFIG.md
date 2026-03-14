# Configuração de Portas - SomaAI Microservices

## Portas Fixas por Serviço

| Serviço | Porta | Variável | Status |
|---------|-------|----------|--------|
| Monolith | 3000 | PORT=3000 | ✅ Principal |
| Sales | 3001 | PORT=3001 | ✅ |
| Inventory | 3002 | PORT=3002 | ✅ |
| Delivery | 3003 | PORT=3003 | ✅ |
| Suppliers | 3004 | PORT=3004 | ✅ |
| Offers | 3005 | PORT=3005 | ✅ |
| Fiscal | 3006 | PORT=3006 | ✅ |
| OCR | 3007 | PORT=3007 | ✅ |
| Payments | 3008 | PORT=3008 | ✅ |
| Orchestrator | 3009 | PORT=3009 | ✅ |
| Auth | 3010 | PORT=3010 | ✅ |
| Business | 3011 | PORT=3011 | ✅ |
| Email | 3012 | PORT=3012 | ✅ |
| Upload | 3013 | PORT=3008 (container) | ✅ |

## Infraestrutura

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| MySQL | 3306 | Banco de dados |
| Redis | 6379 | Cache |
| Kafka | 9092 | Message broker |
| Zookeeper | 2181 | Kafka coordinator |

## URLs Internas (Service-to-Service)

```
Monolith:      http://monolith:3000
Sales:         http://sales:3001
Inventory:     http://inventory:3002
Delivery:      http://delivery:3003
Suppliers:     http://suppliers:3004
Offers:        http://offers:3005
Fiscal:        http://fiscal:3006
OCR:           http://ocr:3007
Payments:      http://payments:3008
Orchestrator:  http://orchestrator:3009
Auth:          http://auth:3010
Business:      http://business:3011
Email:         http://email:3012
```

## URLs Locais (Desenvolvimento)

```
Monolith:      http://localhost:3000
Sales:         http://localhost:3001
Inventory:     http://localhost:3002
Delivery:      http://localhost:3003
Suppliers:     http://localhost:3004
Offers:        http://localhost:3005
Fiscal:        http://localhost:3006
OCR:           http://localhost:3007
Payments:      http://localhost:3008
Orchestrator:  http://localhost:3009
Auth:          http://localhost:3010
Business:      http://localhost:3011
Email:         http://localhost:3012
```

## Variáveis de Ambiente Críticas

### Auth Service (.env)
```env
PORT=3010
MONOLITH_SERVICE_URL=http://localhost:3000
```

### Monolith Service (.env)
```env
PORT=3000
```

### Email Service (.env)
```env
PORT=3012
KAFKA_BROKERS=localhost:9092
```

### Orchestrator Service (.env)
```env
PORT=3009
AUTH_SERVICE_URL=http://localhost:3010
MONOLITH_SERVICE_URL=http://localhost:3000
```

## Como Evitar Conflitos

### 1. Verificar Portas em Uso (Windows PowerShell)
```powershell
# Ver todas as portas em uso
netstat -ano | findstr LISTENING

# Ver processo específico na porta
netstat -ano | findstr :3000

# Matar processo na porta (substitua PID)
taskkill /PID <PID> /F
```

### 2. Matar Todos os Node Processes
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
```

### 3. Verificar se Porta Está Livre
```powershell
Test-NetConnection -ComputerName localhost -Port 3000
```

## Checklist Antes de Iniciar

- [ ] Nenhum processo Node rodando: `Get-Process | Where-Object {$_.ProcessName -like "*node*"}`
- [ ] Docker containers rodando: `docker ps`
- [ ] Kafka rodando: `docker ps | grep kafka`
- [ ] MySQL rodando: `docker ps | grep mysql`
- [ ] Redis rodando: `docker ps | grep redis`

## Ordem Recomendada de Inicialização

1. **Infraestrutura (Docker)**
   ```bash
   docker-compose up -d zookeeper kafka mysql-master redis
   ```

2. **Serviços Principais**
   - Monolith (3000)
   - Auth (3010)
   - Email (3012)

3. **Serviços Secundários**
   - Orchestrator (3009)
   - Sales (3001)
   - Inventory (3002)
   - Delivery (3003)
   - Suppliers (3004)
   - Offers (3005)
   - Fiscal (3006)
   - OCR (3007)
   - Payments (3008)
   - Business (3011)

## Troubleshooting

### Erro: "EADDRINUSE: address already in use :::3000"
```powershell
# Matar processo na porta 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Erro: "Connection refused"
- Verificar se o serviço está rodando
- Verificar se a porta está correta
- Verificar se o firewall está bloqueando

### Erro: "Cannot connect to Kafka"
- Verificar se Kafka está rodando: `docker ps | grep kafka`
- Verificar se KAFKA_BROKERS está correto
- Iniciar Kafka: `docker-compose up -d kafka zookeeper`

## Notas Importantes

⚠️ **Nunca mude as portas sem atualizar:**
- `.env` de cada serviço
- `docker-compose.yml`
- URLs de comunicação entre serviços
- Documentação

⚠️ **Portas 3000-3013 são reservadas para os microserviços**

⚠️ **Se precisar mudar uma porta, mude em TODOS os lugares**
