# Teste de Integração Kafka - Auth Service

## Configuração

### 1. Iniciar infraestrutura Kafka
```bash
docker-compose -f docker-compose-infra.yml up -d
```

### 2. Instalar dependências do auth service
```bash
cd services/auth
npm install --legacy-peer-deps
```

### 3. Iniciar auth service
```bash
npm run start:dev
```

### 4. Verificar logs
Os logs devem mostrar:
- "Kafka service initialized"
- "Subscribed to topic: user.created"
- "Subscribed to topic: user.updated"
- "Subscribed to topic: user.deleted"
- "Subscribed to topic: auth.token.revoked"
- "Subscribed to topic: order.created"

## Testes

### Teste 1: Registro de usuário
```bash
curl -X POST http://localhost:3010/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+5511999999999"
  }'
```

**Verificar:**
- Log: "Published user.created event for user: [id]"
- Log: "Published event to topic user.created"
- Kafka UI (http://localhost:8080): Verificar tópico `user.created`

### Teste 2: Login
```bash
curl -X POST http://localhost:3010/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Verificar:**
- Log: "Published login success event"
- Kafka UI: Verificar tópico `auth.login.success`

### Teste 3: Login falho
```bash
curl -X POST http://localhost:3010/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrong@example.com",
    "password": "wrongpassword"
  }'
```

**Verificar:**
- Log: "Published login failed event"
- Kafka UI: Verificar tópico `auth.login.failed`

## Tópicos Kafka Criados

1. **user.created** - Quando um usuário é registrado
2. **user.updated** - Quando um usuário é atualizado
3. **user.deleted** - Quando um usuário é deletado
4. **auth.token.revoked** - Quando um token é revogado
5. **auth.login.success** - Quando login é bem-sucedido
6. **auth.login.failed** - Quando login falha
7. **auth.registration.success** - Quando registro é bem-sucedido

## Consumidores

O auth service também consome:
- **order.created** - Para sincronização com eventos de pedidos
- **user.created** - Para processar eventos de outros serviços
- **user.updated** - Para processar atualizações de usuários
- **user.deleted** - Para processar exclusões de usuários
- **auth.token.revoked** - Para processar revogações de tokens

## Monitoramento

### Kafka UI
Acessar: http://localhost:8080

### Verificar tópicos
```bash
# Listar tópicos
docker exec kafka-1 kafka-topics --list --bootstrap-server localhost:9092

# Verificar mensagens em um tópico
docker exec kafka-1 kafka-console-consumer \
  --topic user.created \
  --from-beginning \
  --bootstrap-server localhost:9092
```

## Solução de Problemas

### 1. Kafka não está acessível
```bash
# Verificar se os containers estão rodando
docker ps | grep kafka

# Verificar logs do Kafka
docker logs kafka-1
```

### 2. Auth service não consegue conectar ao Kafka
- Verificar variáveis de ambiente `KAFKA_BROKERS`
- Verificar se o Kafka está rodando na porta correta
- Verificar firewall/network

### 3. Eventos não estão sendo publicados
- Verificar logs do auth service
- Verificar se há erros no KafkaService
- Verificar permissões do tópico