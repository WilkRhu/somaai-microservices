# Rodar Tudo no Docker

## Passo 1: Iniciar Docker Desktop

Abra Docker Desktop e aguarde ficar verde (1-2 minutos).

## Passo 2: Rodar Infraestrutura

```bash
docker-compose -f docker-compose-infra.yml up -d
```

Verificar:
```bash
docker-compose -f docker-compose-infra.yml ps
```

## Passo 3: Rodar Serviços

```bash
docker-compose up -d
```

Isso vai fazer build e rodar todos os 12 serviços + infraestrutura.

**Tempo**: 10-15 minutos (primeira vez)

## Passo 4: Verificar Status

```bash
docker-compose ps
```

Esperado: Todos com status "Up"

## Passo 5: Testar

```bash
# Auth
curl http://localhost:3000/health

# Orchestrator
curl http://localhost:3009/health

# Kafka UI
open http://localhost:8080
```

## Comandos Úteis

```bash
# Ver logs
docker-compose logs -f

# Ver logs de um serviço
docker-compose logs -f auth

# Parar tudo
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Rebuild de um serviço
docker-compose build --no-cache auth
docker-compose up -d auth
```

## Troubleshooting

### Timeout ao baixar pacotes

Os Dockerfiles agora têm retry automático. Se ainda der timeout:

```bash
# Aumentar timeout do Docker
# Docker Desktop → Settings → Docker Engine
# Adicionar: "client-timeout": 300

# Ou rodar localmente (mais rápido)
.\scripts\install-all-deps.ps1
```

### Porta já em uso

```bash
# Matar processo
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Sem espaço em disco

```bash
docker system prune -a
docker volume prune
```

## Próximos Passos

1. ✅ Iniciar Docker Desktop
2. ✅ Rodar infraestrutura
3. ✅ Rodar serviços
4. ✅ Testar endpoints
5. Implementar testes
6. Configurar CI/CD

