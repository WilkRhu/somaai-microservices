# Guia Kafka

## 📡 Publicar Eventos

```typescript
// kafka.producer.ts
@Injectable()
export class KafkaProducer {
  constructor(
    @Inject('KAFKA_CLIENT') private kafkaClient: ClientKafka,
  ) {}

  async publishSaleCreated(data: any) {
    await this.kafkaClient.emit('sale.created', data);
  }
}
```

## 📨 Consumir Eventos

```typescript
// kafka.consumer.ts
@Controller()
export class KafkaConsumer {
  @MessagePattern('sale.created')
  async handleSaleCreated(@Payload() data: any) {
    console.log('Evento recebido:', data);
  }
}
```

## 🔍 Monitorar Topics

```bash
# Ver todos os topics
docker exec kafka-1 kafka-topics.sh \
  --list \
  --bootstrap-server localhost:9092

# Ver mensagens
docker exec kafka-1 kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic sale.created \
  --from-beginning

# Ver lag
docker exec kafka-1 kafka-consumer-groups.sh \
  --bootstrap-server localhost:9092 \
  --group sales-service-group \
  --describe
```

## 📊 Estrutura de Eventos

### sale.created
```json
{
  "saleId": "uuid",
  "establishmentId": "uuid",
  "total": 150.50,
  "items": [{"productId": "uuid", "quantity": 2}],
  "timestamp": "2024-03-11T10:30:00Z"
}
```

### inventory.stock.updated
```json
{
  "inventoryItemId": "uuid",
  "previousStock": 100,
  "newStock": 98,
  "type": "SALE",
  "timestamp": "2024-03-11T10:30:05Z"
}
```

## 🛠️ Troubleshooting

### Consumer lag alto
```bash
# Aumentar partições
docker exec kafka-1 kafka-topics.sh \
  --alter \
  --topic sale.created \
  --partitions 6 \
  --bootstrap-server localhost:9092
```

### Mensagens não sendo consumidas
```bash
# Resetar offset
docker exec kafka-1 kafka-consumer-groups.sh \
  --bootstrap-server localhost:9092 \
  --group sales-service-group \
  --reset-offsets \
  --to-earliest \
  --execute \
  --topic sale.created
```
