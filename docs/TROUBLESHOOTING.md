# Troubleshooting

## 🔴 Serviço não inicia

```bash
# Ver logs
docker-compose logs sales-service

# Rebuild
docker-compose up -d --build sales-service

# Verificar porta
lsof -i :3001
```

## 🔴 Kafka não conecta

```bash
# Verificar conectividade
docker exec sales-service nc -zv kafka-1 29092

# Ver logs do Kafka
docker-compose logs kafka-1

# Reiniciar Kafka
docker-compose restart kafka-1 kafka-2 kafka-3
```

## 🔴 Database connection error

```bash
# Verificar conectividade
docker exec sales-service mysql -h mysql-master -u somaai -psomaai_password -e "SELECT 1"

# Ver logs do MySQL
docker-compose logs mysql-master

# Reiniciar MySQL
docker-compose restart mysql-master
```

## 🔴 Lag alto no Kafka

```bash
# Ver lag
docker exec kafka-1 kafka-consumer-groups.sh \
  --bootstrap-server localhost:9092 \
  --group sales-service-group \
  --describe

# Aumentar partições
docker exec kafka-1 kafka-topics.sh \
  --alter \
  --topic sale.created \
  --partitions 6 \
  --bootstrap-server localhost:9092
```

## 🔴 Redis não conecta

```bash
# Verificar
docker exec redis redis-cli ping

# Ver logs
docker-compose logs redis

# Reiniciar
docker-compose restart redis
```

## 🔴 Nginx retorna 502

```bash
# Verificar upstream
docker exec nginx-gateway curl http://sales-service:3001/health

# Ver logs do Nginx
docker-compose logs nginx-gateway

# Reiniciar
docker-compose restart nginx-gateway
```

## 📊 Verificar Saúde

```bash
./scripts/health-check.sh
```

## 🆘 Resetar Tudo

```bash
# Parar e remover volumes
docker-compose down -v

# Rebuild
docker-compose build

# Start
docker-compose up -d
```
