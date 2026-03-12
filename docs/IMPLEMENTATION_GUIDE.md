# Guia de Implementação dos Serviços

## 📁 Estrutura de um Serviço

```
somaaibackend-sales/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── sales/
│   │   ├── sales.module.ts
│   │   ├── sales.service.ts
│   │   ├── sales.controller.ts
│   │   ├── entities/
│   │   │   ├── sale.entity.ts
│   │   │   └── sale-item.entity.ts
│   │   ├── dto/
│   │   │   ├── create-sale.dto.ts
│   │   │   └── sale-response.dto.ts
│   │   ├── repositories/
│   │   │   └── sale.repository.ts
│   │   └── kafka/
│   │       ├── sales.producer.ts
│   │       └── sales.consumer.ts
│   └── shared/
│       ├── guards/jwt.guard.ts
│       └── decorators/auth.decorator.ts
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── package.json
```

## 🔧 Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci

COPY src ./src

RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY package*.json ./

RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
```

## 📨 Kafka Producer

```typescript
// kafka.producer.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

@Injectable()
export class KafkaProducer implements OnModuleInit {
  constructor(
    @Inject('KAFKA_CLIENT') private kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async publishSaleCreated(data: any) {
    await this.kafkaClient.emit('sale.created', data);
  }

  async publishSaleCompleted(data: any) {
    await this.kafkaClient.emit('sale.completed', data);
  }
}
```

## 📨 Kafka Consumer

```typescript
// kafka.consumer.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class KafkaConsumer {
  constructor(private salesService: SalesService) {}

  @MessagePattern('sale.created')
  async handleSaleCreated(@Payload() data: any) {
    console.log('📨 Evento recebido: sale.created', data);
    // Processar evento
  }

  @MessagePattern('sale.completed')
  async handleSaleCompleted(@Payload() data: any) {
    console.log('📨 Evento recebido: sale.completed', data);
  }
}
```

## 🎯 Exemplo Prático: Fluxo de Venda

### Sales Service - Criar Venda

```typescript
// sales.service.ts
@Injectable()
export class SalesService {
  constructor(
    private kafkaProducer: KafkaProducer,
  ) {}

  async createSale(createSaleDto: CreateSaleDto): Promise<Sale> {
    // 1. Criar venda no banco
    const sale = await this.saleRepository.save({
      ...createSaleDto,
      status: 'PENDING',
    });

    // 2. Publicar evento
    await this.kafkaProducer.publishSaleCreated({
      saleId: sale.id,
      establishmentId: sale.establishmentId,
      total: sale.total,
      items: sale.items,
      timestamp: new Date().toISOString(),
    });

    return sale;
  }
}
```

### Inventory Service - Consumir Evento

```typescript
// kafka.consumer.ts
@MessagePattern('sale.created')
async handleSaleCreated(@Payload() data: any) {
  console.log('📨 Venda criada, atualizando estoque...', data.saleId);

  try {
    // Atualizar estoque para cada item
    for (const item of data.items) {
      await this.inventoryService.updateStock(
        item.productId,
        -item.quantity,
        'SALE',
        data.saleId,
      );
    }

    console.log('✅ Estoque atualizado');
  } catch (error) {
    console.error('❌ Erro ao atualizar estoque:', error);
  }
}
```

## 🏗️ Módulo Kafka

```typescript
// kafka.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KafkaProducer } from './kafka.producer';
import { KafkaConsumer } from './kafka.consumer';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_CLIENT',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              brokers: config.get('KAFKA_BROKERS').split(','),
              clientId: config.get('KAFKA_CLIENT_ID'),
            },
            consumer: {
              groupId: config.get('KAFKA_GROUP_ID'),
              allowAutoTopicCreation: true,
            },
          },
        }),
      },
    ]),
  ],
  providers: [KafkaProducer, KafkaConsumer],
  exports: [KafkaProducer],
})
export class KafkaModule {}
```

## 🔍 Monitoramento de Eventos

```bash
# Ver todos os topics
docker exec kafka-1 kafka-topics.sh \
  --list \
  --bootstrap-server localhost:9092

# Ver mensagens em tempo real
docker exec kafka-1 kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic sale.created \
  --from-beginning

# Ver lag dos consumers
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
  "customerId": "uuid",
  "total": 150.50,
  "items": [
    {
      "productId": "uuid",
      "quantity": 2
    }
  ],
  "timestamp": "2024-03-11T10:30:00Z"
}
```

### inventory.stock.updated
```json
{
  "inventoryItemId": "uuid",
  "productId": "uuid",
  "previousStock": 100,
  "newStock": 98,
  "quantity": -2,
  "type": "SALE",
  "reference": "sale-uuid",
  "timestamp": "2024-03-11T10:30:05Z"
}
```

## 🛠️ Checklist de Implementação

- [ ] Criar KafkaModule em cada serviço
- [ ] Implementar KafkaProducer
- [ ] Implementar KafkaConsumer
- [ ] Definir estrutura de eventos
- [ ] Testar publicação de eventos
- [ ] Testar consumo de eventos
- [ ] Implementar error handling
- [ ] Configurar retry policy
- [ ] Monitorar lag dos consumers
- [ ] Documentar eventos
