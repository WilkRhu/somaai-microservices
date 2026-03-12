# Payments Service

Serviço responsável pelo processamento de pagamentos com integração ao MercadoPago.

## Funcionalidades

- Processamento de pagamentos
- Integração com MercadoPago
- Suporte a múltiplos métodos de pagamento
- Reembolso de pagamentos
- Webhooks para notificações
- Publicação de eventos via Kafka

## Endpoints

### Processar Pagamento
```
POST /api/payments/process
Content-Type: application/json

{
  "orderId": "order-123",
  "amount": 100.00,
  "paymentMethod": "credit_card",
  "description": "Compra de produtos",
  "customerEmail": "customer@example.com",
  "customerName": "João Silva"
}
```

### Obter Pagamento
```
GET /api/payments/:id
```

### Listar Pagamentos
```
GET /api/payments?orderId=order-123&status=completed
```

### Reembolsar Pagamento
```
POST /api/payments/:id/refund
```

### Webhook
```
POST /api/payments/webhook
Content-Type: application/json

{
  "id": "webhook-id",
  "type": "payment.success",
  "data": {...}
}
```

## Variáveis de Ambiente

```
NODE_ENV=development
PORT=3005
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=payments_db
DB_SYNCHRONIZE=true
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=payments-service
MERCADOPAGO_ACCESS_TOKEN=your-access-token
MERCADOPAGO_PUBLIC_KEY=your-public-key
JWT_SECRET=your-secret-key
LOG_LEVEL=debug
WEBHOOK_URL=http://localhost:3005/api/payments/webhook
```

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run start:dev
```

## Build

```bash
npm run build
```

## Testes

```bash
npm run test
```

## Docker

```bash
docker-compose up
```

## Kafka Topics

- `payment.initiated` - Pagamento iniciado
- `payment.completed` - Pagamento completado com sucesso
- `payment.failed` - Falha no processamento do pagamento

## Status de Pagamento

- `pending` - Aguardando processamento
- `processing` - Sendo processado
- `completed` - Completado com sucesso
- `failed` - Falha no processamento
- `cancelled` - Cancelado
- `refunded` - Reembolsado

## Métodos de Pagamento Suportados

- `credit_card` - Cartão de crédito
- `debit_card` - Cartão de débito
- `pix` - PIX
- `boleto` - Boleto bancário
- `wallet` - Carteira digital

## Integração com MercadoPago

O serviço se integra com a API do MercadoPago para:
- Criar pagamentos
- Consultar status de pagamentos
- Reembolsar pagamentos
- Receber webhooks de notificação

## Estrutura de Pastas

```
src/
├── app.controller.ts
├── app.module.ts
├── app.service.ts
├── main.ts
├── payments/
│   ├── payments.controller.ts
│   ├── payments.module.ts
│   ├── payments.service.ts
│   ├── dto/
│   │   ├── process-payment.dto.ts
│   │   └── payment-response.dto.ts
│   ├── entities/
│   │   └── payment.entity.ts
│   └── services/
│       └── mercadopago.service.ts
└── kafka/
    └── payments.producer.ts
```

## Próximas Etapas

- [ ] Implementar integração real com MercadoPago
- [ ] Implementar validação de webhook
- [ ] Suporte a parcelamento
- [ ] Suporte a múltiplas moedas
- [ ] Implementar retry logic
- [ ] Adicionar testes unitários
- [ ] Adicionar testes de integração
