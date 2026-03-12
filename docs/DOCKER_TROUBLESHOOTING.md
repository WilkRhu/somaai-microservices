# Docker Troubleshooting Guide

**Data**: March 12, 2026  
**Objetivo**: Resolver problemas comuns ao rodar Docker

---

## 🔍 Diagnóstico Rápido

### Verificar Status Geral

```bash
# Ver todos os containers
docker-compose ps

# Ver logs de todos os serviços
docker-compose logs -f

# Ver recursos usados
docker stats

# Verificar rede
docker network ls
docker network inspect somaai-network
```

---

## ❌ Problemas Comuns e Soluções

### 1. "Port already in use"

**Erro**:
```
Error response from daemon: Ports are not available: exposing port TCP 0.0.0.0:3000 -> 0.0.0.0:0: listen tcp 0.0.0.0:3000: bind: An attempt was made to use a socket in a way forbidden by its access rules.
```

**Solução**:

```bash
# Opção 1: Parar containers existentes
docker-compose down

# Opção 2: Verificar qual processo está usando a porta
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# Opção 3: Mudar porta no docker-compose.yml
# Editar: ports: ["3001:3000"]
```

---

### 2. "Connection refused"

**Erro**:
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solução**:

```bash
# Aguardar 30-60 segundos para iniciar
# Ver logs do MySQL
docker-compose logs mysql-master

# Verificar se MySQL está saudável
docker-compose ps mysql-master

# Reiniciar MySQL
docker-compose restart mysql-master

# Verificar conectividade
docker-compose exec mysql-master mysqladmin ping -h localhost
```

---

### 3. "Cannot find module"

**Erro**:
```
Error: Cannot find module '@nestjs/common'
```

**Solução**:

```bash
# Verificar se package.json existe
ls -la services/auth/package.json

# Rebuild do serviço
docker-compose build --no-cache auth

# Verificar logs do build
docker-compose build auth 2>&1 | tail -50

# Limpar cache do Docker
docker system prune -a
docker-compose build --no-cache
```

---

### 4. "Out of memory"

**Erro**:
```
Error: JavaScript heap out of memory
```

**Solução**:

```bash
# Aumentar recursos do Docker Desktop
# Windows/Mac: Docker Desktop → Settings → Resources
# - CPUs: 4+
# - Memory: 8GB+
# - Swap: 2GB+

# Ou limitar memória de um serviço
# Editar docker-compose.yml:
services:
  auth:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

# Reiniciar
docker-compose up -d
```

---

### 5. "Kafka not connecting"

**Erro**:
```
Error: Failed to connect to Kafka broker
```

**Solução**:

```bash
# Verificar se Zookeeper está rodando
docker-compose logs zookeeper

# Verificar se Kafka está rodando
docker-compose logs kafka-1

# Aguardar Zookeeper iniciar primeiro
docker-compose up -d zookeeper
sleep 30
docker-compose up -d kafka-1 kafka-2 kafka-3

# Testar conectividade
docker-compose exec kafka-1 kafka-broker-api-versions.sh --bootstrap-server localhost:9092

# Ver logs detalhados
docker-compose logs -f kafka-1
```

---

### 6. "MySQL connection timeout"

**Erro**:
```
Error: connect ETIMEDOUT
```

**Solução**:

```bash
# Verificar se MySQL está saudável
docker-compose ps mysql-master

# Ver logs do MySQL
docker-compose logs mysql-master

# Reiniciar MySQL
docker-compose restart mysql-master

# Aguardar healthcheck passar
docker-compose logs mysql-master | grep "health"

# Testar conexão
docker-compose exec mysql-master mysql -u somaai -p somaai_password -e "SELECT 1"
```

---

### 7. "Redis connection refused"

**Erro**:
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solução**:

```bash
# Verificar se Redis está rodando
docker-compose ps redis

# Ver logs do Redis
docker-compose logs redis

# Testar conectividade
docker-compose exec redis redis-cli ping

# Reiniciar Redis
docker-compose restart redis

# Verificar healthcheck
docker-compose logs redis | grep "health"
```

---

### 8. "Service not starting"

**Erro**:
```
Container exited with code 1
```

**Solução**:

```bash
# Ver logs detalhados
docker-compose logs auth

# Verificar se Dockerfile está correto
cat services/auth/Dockerfile

# Verificar se package.json existe
cat services/auth/package.json

# Rebuild
docker-compose build --no-cache auth

# Iniciar com logs
docker-compose up auth

# Se ainda não funcionar, verificar:
# 1. Variáveis de ambiente
# 2. Dependências no package.json
# 3. Arquivo main.ts
```

---

### 9. "Network not found"

**Erro**:
```
Error: network somaai-network not found
```

**Solução**:

```bash
# Criar network manualmente
docker network create somaai-network

# Ou deixar docker-compose criar
docker-compose up -d

# Verificar network
docker network ls
docker network inspect somaai-network
```

---

### 10. "Disk space full"

**Erro**:
```
Error: no space left on device
```

**Solução**:

```bash
# Ver espaço em disco
df -h

# Limpar Docker
docker system prune -a
docker volume prune

# Remover containers parados
docker container prune

# Remover imagens não usadas
docker image prune -a

# Remover volumes não usados
docker volume prune

# Se ainda não funcionar, aumentar espaço em disco
```

---

## 🔧 Debugging Avançado

### Ver Logs Detalhados

```bash
# Todos os serviços
docker-compose logs -f

# Serviço específico
docker-compose logs -f auth

# Últimas 100 linhas
docker-compose logs --tail=100 auth

# Com timestamps
docker-compose logs -f --timestamps auth

# Seguir logs em tempo real
docker-compose logs -f auth | grep "error"
```

### Executar Comandos em Containers

```bash
# Bash interativo
docker-compose exec auth bash

# Executar comando
docker-compose exec auth npm run test

# Executar com variáveis de ambiente
docker-compose exec -e NODE_ENV=test auth npm run test

# Executar como root
docker-compose exec -u root auth apt-get update
```

### Inspecionar Containers

```bash
# Ver detalhes do container
docker-compose exec auth env

# Ver processos rodando
docker-compose exec auth ps aux

# Ver arquivos
docker-compose exec auth ls -la /app

# Ver variáveis de ambiente
docker-compose exec auth printenv
```

### Testar Conectividade

```bash
# Testar conexão entre containers
docker-compose exec auth curl http://mysql-master:3306

# Testar DNS
docker-compose exec auth nslookup mysql-master

# Testar porta
docker-compose exec auth nc -zv mysql-master 3306

# Testar HTTP
docker-compose exec auth curl http://orchestrator:3009/health
```

---

## 🔄 Reset e Limpeza

### Reset Completo

```bash
# Parar e remover tudo
docker-compose down -v

# Limpar Docker
docker system prune -a

# Reconstruir
docker-compose build --no-cache

# Reiniciar
docker-compose up -d
```

### Reset Parcial

```bash
# Parar um serviço
docker-compose stop auth

# Remover um serviço
docker-compose rm auth

# Rebuild de um serviço
docker-compose build --no-cache auth

# Reiniciar um serviço
docker-compose up -d auth
```

### Limpar Volumes

```bash
# Remover volumes
docker-compose down -v

# Remover volume específico
docker volume rm somaai_mysql_master_data

# Listar volumes
docker volume ls
```

---

## 📊 Monitoramento

### Ver Recursos

```bash
# Recursos em tempo real
docker stats

# Recursos de um container específico
docker stats auth

# Histórico de recursos
docker stats --no-stream
```

### Ver Eventos

```bash
# Ver eventos do Docker
docker events

# Ver eventos de um container
docker events --filter container=auth
```

### Ver Logs do Sistema

```bash
# Logs do Docker daemon
# Windows: C:\ProgramData\Docker\config\daemon.json
# Mac: ~/Library/Containers/com.docker.docker/Data/log/vm/dockerd.log
# Linux: journalctl -u docker
```

---

## 🚨 Problemas Críticos

### Serviço não inicia após 5 minutos

```bash
# 1. Ver logs
docker-compose logs auth

# 2. Verificar se dependências estão prontas
docker-compose ps

# 3. Verificar variáveis de ambiente
docker-compose exec auth printenv

# 4. Verificar conectividade
docker-compose exec auth curl http://mysql-master:3306

# 5. Rebuild
docker-compose build --no-cache auth
docker-compose up -d auth
```

### Todos os serviços caindo

```bash
# 1. Ver logs de todos
docker-compose logs

# 2. Verificar recursos
docker stats

# 3. Verificar rede
docker network inspect somaai-network

# 4. Restart tudo
docker-compose restart

# 5. Se não funcionar, reset completo
docker-compose down -v
docker-compose up -d
```

### Banco de dados corrompido

```bash
# 1. Parar MySQL
docker-compose stop mysql-master

# 2. Remover volume
docker volume rm somaai_mysql_master_data

# 3. Reiniciar
docker-compose up -d mysql-master

# 4. Aguardar inicializar
sleep 30

# 5. Verificar
docker-compose logs mysql-master
```

---

## 📞 Suporte

### Informações Úteis para Relatar Problemas

```bash
# Versão do Docker
docker --version

# Versão do Docker Compose
docker-compose --version

# Status dos containers
docker-compose ps

# Logs dos últimos 100 linhas
docker-compose logs --tail=100

# Recursos usados
docker stats --no-stream

# Informações do sistema
docker info
```

### Comandos para Coletar Informações

```bash
# Salvar logs em arquivo
docker-compose logs > logs.txt

# Salvar status em arquivo
docker-compose ps > status.txt

# Salvar recursos em arquivo
docker stats --no-stream > resources.txt

# Salvar tudo
docker-compose logs > logs.txt && \
docker-compose ps > status.txt && \
docker stats --no-stream > resources.txt
```

---

## ✅ Checklist de Troubleshooting

- [ ] Verificar `docker-compose ps`
- [ ] Verificar logs com `docker-compose logs -f`
- [ ] Verificar recursos com `docker stats`
- [ ] Verificar rede com `docker network inspect somaai-network`
- [ ] Verificar portas com `netstat -ano`
- [ ] Verificar variáveis de ambiente
- [ ] Verificar conectividade entre containers
- [ ] Rebuild do serviço problemático
- [ ] Reset completo se necessário

---

**Problema não resolvido?** Colete as informações acima e abra uma issue! 🚀

