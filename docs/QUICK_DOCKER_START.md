# Quick Docker Start - 5 Minutos

**Status**: ✅ Pronto para Rodar  
**Tempo**: ~5 minutos para setup + 5-10 minutos para iniciar

---

## 🚀 Começar Agora

### Passo 1: Preparar Ambiente (1 min)

```bash
# Copiar arquivo de configuração
cp .env.example .env
```

### Passo 2: Build (2-3 min)

```bash
# Build de todos os serviços
docker-compose build
```

### Passo 3: Iniciar (1 min)

```bash
# Iniciar todos os serviços
docker-compose up -d
```

### Passo 4: Verificar (1 min)

```bash
# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f
```

---

## ✅ Verificação Rápida

### Todos os Serviços Rodando?

```bash
docker-compose ps
```

Esperado: Todos com status "Up"

### Testar Conectividade

```bash
# Auth Service
curl http://localhost:3000/health

# Orchestrator
curl http://localhost:3009/health

# Kafka UI
open http://localhost:8080
```

---

## 🛑 Parar Tudo

```bash
# Parar todos os serviços
docker-compose down

# Parar e remover volumes (reset completo)
docker-compose down -v
```

---

## 📊 Portas Disponíveis

| Serviço | Porta | URL |
|---------|-------|-----|
| Auth | 3000 | http://localhost:3000 |
| Sales | 3001 | http://localhost:3001 |
| Inventory | 3002 | http://localhost:3002 |
| Delivery | 3003 | http://localhost:3003 |
| Suppliers | 3004 | http://localhost:3004 |
| Offers | 3005 | http://localhost:3005 |
| Fiscal | 3006 | http://localhost:3006 |
| OCR | 3007 | http://localhost:3007 |
| Payments | 3008 | http://localhost:3008 |
| Orchestrator | 3009 | http://localhost:3009 |
| Monolith | 3010 | http://localhost:3010 |
| Business | 3011 | http://localhost:3011 |
| Kafka UI | 8080 | http://localhost:8080 |
| MySQL | 3306 | localhost:3306 |
| Redis | 6379 | localhost:6379 |

---

## 🔧 Comandos Úteis

```bash
# Ver logs de um serviço específico
docker-compose logs -f auth

# Rebuild de um serviço
docker-compose build --no-cache auth
docker-compose up -d auth

# Executar comando em um container
docker-compose exec auth npm run test

# Ver recursos usados
docker stats

# Limpar tudo
docker-compose down -v
docker system prune -a
```

---

## ⚠️ Problemas Comuns

### "Port already in use"
```bash
# Parar containers existentes
docker-compose down
```

### "Connection refused"
```bash
# Aguardar 30-60 segundos para iniciar
# Ver logs
docker-compose logs -f
```

### "Out of memory"
```bash
# Aumentar recursos do Docker Desktop
# Settings → Resources → Memory: 8GB+
```

---

## 📚 Documentação Completa

- [DOCKER_DEPLOYMENT_STATUS.md](DOCKER_DEPLOYMENT_STATUS.md) - Status detalhado
- [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md) - Guia completo
- [DOCKER_READY_CHECKLIST.md](DOCKER_READY_CHECKLIST.md) - Checklist

---

**Pronto?** Execute: `docker-compose up -d` 🚀

