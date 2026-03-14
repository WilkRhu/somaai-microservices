# Integração Kafka: Monolith ↔ Orquestrador

## Visão Geral

O Monolith agora está conectado ao Kafka e pode se comunicar com o Orquestrador através de eventos assíncronos.

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      KAFKA BROKER                           │
│                    (kafka:9092)                             │
└─────────────────────────────────────────────────────────────┘
         ↑                                    ↑
         │                                    │
    Publish                              Subscribe
         │                                    │
    ┌────┴────────────────────────────────────┴────┐
    │                                               │
┌───▼────────────┐                      ┌──────────▼──────┐
│   MONOLITH     │                      │  ORCHESTRATOR   │
│   Service      │                      │   Service       │
│                │                      │                 │
│ - Purchases    │                      │ - Business      │
│ - Users        │                      │ - Sales         │
│ - Subscriptions│                      │ - Inventory     │
└────────────────┘                      └─────────────────┘
```

## Tópicos Kafka

### Publicados pelo Monolith

- **purchase.created**: Quando uma compra é criada
  ```json
  {
    "id": "purchase-123",
    "userId": "user-456",
    "total": 150.50,
    "status": "pending",
    "createdAt": "2026-03-13T23:37:59Z"
  }
  ```

- **purchase.updated**: Quando uma compra é atualizada
  ```json
  {
    "id": "purchase-123",
    "userId": "user-456",
    "status": "completed",
    "updatedAt": "2026-03-13T23:40:00Z"
  }
  ```

- **user.registered**: Quando um novo usuário se registra
  ```json
  {
    "id": "user-456",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-03-13T23:37:59Z"
  }
  ```

- **subscription.created**: Quando uma assinatura é criada
  ```json
  {
    "id": "subscription-789",
    "userId": "user-456",
    "plan": "premium",
    "createdAt": "2026-03-13T23:37:59Z"
  }
  ```

### Consumidos pelo Monolith

- **order.created**: Eventos de pedidos criados em outros serviços
- **order.updated**: Eventos de pedidos atualizados
- **user.created**: Eventos de usuários criados em outros serviços
- **user.updated**: Eventos de usuários atualizados

## Implementação

### KafkaService

Localizado em `services/monolith/src/kafka/kafka.service.ts`

Responsabilidades:
- Conectar ao broker Kafka
- Publicar eventos
- Gerenciar subscriptions
- Iniciar o consumer

### MonolithConsumerService

Localizado em `services/monolith/src/kafka/monolith.consumer.ts`

Responsabilidades:
- Registrar callbacks para tópicos
- Processar mensagens recebidas
- Implementar lógica de negócio para eventos

### Integração com PurchasesService

O `PurchasesService` agora:
1. Cria uma compra via HTTP para o Orquestrador
2. Publica um evento `purchase.created` no Kafka
3. Outros serviços podem reagir a este evento

## Fluxo de Exemplo: Criar Compra

```
1. Cliente → POST /purchases
   ↓
2. PurchasesController → PurchasesService.createPurchase()
   ↓
3. PurchasesService → HTTP POST ao Orquestrador
   ↓
4. Orquestrador processa e retorna compra criada
   ↓
5. PurchasesService → Publica evento "purchase.created" no Kafka
   ↓
6. Outros serviços (via Orquestrador) recebem o evento
   ↓
7. Lógica de negócio é executada (ex: atualizar inventário)
```

## Configuração

### Variáveis de Ambiente

No `docker-compose.yml`, o monolith já tem:

```yaml
environment:
  KAFKA_BROKERS: kafka:9092
  KAFKA_GROUP_ID: monolith-group
```

### Dependências

O monolith depende do Kafka estar saudável:

```yaml
depends_on:
  kafka:
    condition: service_healthy
```

## Testando a Integração

### 1. Verificar Logs do Monolith

```bash
docker logs monolith-service | grep -i kafka
```

Você deve ver:
```
[KafkaService] Kafka producer connected successfully
[KafkaService] Kafka consumer connected successfully
[MonolithConsumerService] Starting Kafka topic subscriptions...
[MonolithConsumerService] Subscribed to topic: order.created
[MonolithConsumerService] Kafka topic subscriptions completed successfully
```

### 2. Criar uma Compra

```bash
curl -X POST http://localhost:3010/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "type": "PRODUCT",
    "merchant": "Supermercado XYZ",
    "description": "Compra de alimentos",
    "amount": 150.50,
    "paymentMethod": "pix"
  }'
```

### 3. Verificar Evento Publicado

Nos logs do monolith, você deve ver:
```
[KafkaService] Published event to topic purchase.created: {...}
```

### 4. Verificar Consumo no Orquestrador

Se o Orquestrador estiver inscrito em `purchase.created`, você verá:
```
[KafkaService] Received message from topic purchase.created
```

## Próximos Passos

1. **Adicionar mais eventos**: Implementar publicação de eventos para outras operações
2. **Handlers no Orquestrador**: Criar handlers para processar eventos do Monolith
3. **Retry Logic**: Implementar retry automático para falhas de publicação
4. **Dead Letter Queue**: Configurar DLQ para mensagens que falham
5. **Monitoramento**: Adicionar métricas de Kafka ao Prometheus

## Troubleshooting

### Erro: "Cannot subscribe to topic while consumer is running"

**Solução**: Já foi corrigido na versão atual. O consumer agora aguarda todas as subscriptions antes de iniciar.

### Erro: "Kafka service not initialized"

**Verificar**:
- Kafka está rodando: `docker ps | grep kafka`
- KAFKA_BROKERS está correto no .env
- Logs do Kafka: `docker logs kafka`

### Mensagens não estão sendo recebidas

**Verificar**:
- Consumer está rodando: `docker logs monolith-service | grep "consumer started"`
- Tópico existe: `docker exec kafka kafka-topics --list --bootstrap-server localhost:9092`
- Group ID está correto: `docker exec kafka kafka-consumer-groups --list --bootstrap-server localhost:9092`
