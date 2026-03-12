# 📑 Índice de Documentação

## 🚀 Comece Aqui

1. **[QUICK_START.md](QUICK_START.md)** - 5 minutos para começar
2. **[README.md](README.md)** - Visão geral do projeto
3. **[STRUCTURE.md](STRUCTURE.md)** - Estrutura de pastas

## 📚 Documentação Principal

### Arquitetura
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Arquitetura de microserviços
- **[docs/MICROSERVICES_ARCHITECTURE_DETAILED.md](docs/MICROSERVICES_ARCHITECTURE_DETAILED.md)** - Análise detalhada

### Implementação
- **[docs/IMPLEMENTATION_GUIDE.md](docs/IMPLEMENTATION_GUIDE.md)** - Como implementar os serviços
- **[docs/DOCKER_SETUP.md](docs/DOCKER_SETUP.md)** - Setup Docker Compose

### Operação
- **[docs/KAFKA_GUIDE.md](docs/KAFKA_GUIDE.md)** - Guia de uso do Kafka
- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Deployment e monitoramento
- **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Solução de problemas

## 🎯 Por Nível de Experiência

### Iniciante
1. Leia [QUICK_START.md](QUICK_START.md)
2. Execute `./scripts/start.sh`
3. Acesse http://localhost:8080

### Intermediário
1. Leia [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
2. Leia [docs/KAFKA_GUIDE.md](docs/KAFKA_GUIDE.md)
3. Explore `docker-compose.yml`

### Avançado
1. Leia [docs/MICROSERVICES_ARCHITECTURE_DETAILED.md](docs/MICROSERVICES_ARCHITECTURE_DETAILED.md)
2. Leia [docs/IMPLEMENTATION_GUIDE.md](docs/IMPLEMENTATION_GUIDE.md)
3. Customize `nginx/nginx.conf`

## 📊 Por Tarefa

### Quero começar rápido
→ [QUICK_START.md](QUICK_START.md)

### Quero entender a arquitetura
→ [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

### Quero implementar um novo serviço
→ [docs/IMPLEMENTATION_GUIDE.md](docs/IMPLEMENTATION_GUIDE.md)

### Quero usar Kafka
→ [docs/KAFKA_GUIDE.md](docs/KAFKA_GUIDE.md)

### Quero fazer deploy
→ [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

### Tenho um problema
→ [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

## 🛠️ Scripts Disponíveis

```bash
./scripts/start.sh          # Inicia todos os serviços
./scripts/stop.sh           # Para todos os serviços
./scripts/health-check.sh   # Verifica saúde
./scripts/logs.sh           # Ver logs
```

## 📱 Acessar Serviços

```
API Gateway:    http://localhost
Kafka UI:       http://localhost:8080
Prometheus:     http://localhost:9090
Grafana:        http://localhost:3100
```

## 🔄 Fluxo Recomendado

1. **Leia** [QUICK_START.md](QUICK_START.md) (5 min)
2. **Execute** `./scripts/start.sh` (2 min)
3. **Verifique** `./scripts/health-check.sh` (1 min)
4. **Explore** http://localhost:8080 (5 min)
5. **Leia** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) (15 min)
6. **Leia** [docs/KAFKA_GUIDE.md](docs/KAFKA_GUIDE.md) (10 min)

## 📞 Suporte Rápido

### Serviço não inicia?
```bash
docker-compose logs sales-service
```

### Kafka não conecta?
```bash
docker-compose restart kafka-1 kafka-2 kafka-3
```

### Tudo quebrado?
```bash
docker-compose down -v
./scripts/start.sh
```

## 🎓 Estrutura de Aprendizado

```
Iniciante
    ↓
QUICK_START.md (5 min)
    ↓
./scripts/start.sh
    ↓
Intermediário
    ↓
docs/ARCHITECTURE.md (15 min)
    ↓
docs/KAFKA_GUIDE.md (10 min)
    ↓
Avançado
    ↓
docs/IMPLEMENTATION_GUIDE.md (20 min)
    ↓
docs/MICROSERVICES_ARCHITECTURE_DETAILED.md (30 min)
    ↓
Especialista
```

## 📄 Resumos Rápidos

- **[RESUMO_COMPLETO.md](RESUMO_COMPLETO.md)** - Resumo executivo
- **[STRUCTURE.md](STRUCTURE.md)** - Estrutura de pastas

## 🚀 Próximos Passos

1. Escolha seu nível (Iniciante/Intermediário/Avançado)
2. Siga o fluxo recomendado
3. Consulte a documentação conforme necessário
4. Divirta-se! 🎉

---

**Última atualização**: Março 2024
**Versão**: 1.0.0
