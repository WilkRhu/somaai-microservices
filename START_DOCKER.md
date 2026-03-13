# Iniciar Docker e Rodar Aplicação

## Passo 1: Iniciar Docker Desktop

### Windows
1. Abra o **Docker Desktop** (procure no menu Iniciar)
2. Aguarde até que o ícone do Docker fique verde (rodando)
3. Pode levar 1-2 minutos

### Mac
1. Abra o **Docker.app** (em Applications)
2. Aguarde até que o ícone do Docker fique verde
3. Pode levar 1-2 minutos

### Linux
```bash
sudo systemctl start docker
```

## Passo 2: Verificar Docker

```bash
docker ps
```

Se funcionar, você verá uma lista vazia de containers.

## Passo 3: Rodar Infraestrutura

```bash
# Iniciar apenas infraestrutura (MySQL, Redis, Kafka)
docker-compose -f docker-compose-infra.yml up -d

# Verificar status
docker-compose -f docker-compose-infra.yml ps
```

Esperado:
```
NAME                STATUS
zookeeper          Up (healthy)
kafka-1            Up (healthy)
kafka-2            Up (healthy)
kafka-3            Up (healthy)
kafka-ui           Up
mysql-master       Up (healthy)
redis              Up (healthy)
```

## Passo 4: Instalar Dependências dos Serviços

```bash
# Windows
.\scripts\install-all-deps.ps1

# Linux/Mac
bash scripts/install-all-deps.sh
```

## Passo 5: Rodar Serviços Localmente

Abra múltiplos terminais e execute:

```bash
# Terminal 1
cd services/auth && npm run start:dev

# Terminal 2
cd services/orchestrator && npm run start:dev

# Terminal 3
cd services/business && npm run start:dev

# ... etc para outros serviços
```

## Passo 6: Testar

```bash
# Verificar infraestrutura
curl http://localhost:3306  # MySQL
redis-cli ping              # Redis
curl http://localhost:8080  # Kafka UI

# Verificar serviços
curl http://localhost:3000/health  # Auth
curl http://localhost:3009/health  # Orchestrator
```

## Comandos Úteis

```bash
# Ver status da infraestrutura
docker-compose -f docker-compose-infra.yml ps

# Ver logs
docker-compose -f docker-compose-infra.yml logs -f

# Parar infraestrutura
docker-compose -f docker-compose-infra.yml down

# Parar e remover volumes
docker-compose -f docker-compose-infra.yml down -v
```

## Próximos Passos

1. ✅ Iniciar Docker Desktop
2. ✅ Rodar infraestrutura
3. ✅ Instalar dependências
4. ✅ Rodar serviços
5. ✅ Testar endpoints

Veja `SETUP_LOCAL.md` para instruções completas!

