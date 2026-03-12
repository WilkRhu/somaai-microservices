# Delivery Service

Delivery tracking service for SomaAI Microservices. Handles delivery management and tracking.

## Features

- Create and manage deliveries
- Track delivery status (pending, processing, in_transit, delivered, failed)
- Generate tracking codes
- Estimate and actual delivery dates
- Kafka events for delivery lifecycle

## Endpoints

- `POST /api/deliveries` - Create delivery
- `GET /api/deliveries/:id` - Get delivery by ID
- `GET /api/deliveries` - List deliveries (with filters)
- `PATCH /api/deliveries/:id` - Update delivery
- `POST /api/deliveries/:id/track` - Track delivery

## Kafka Topics

**Producer:**
- `delivery.created` - Delivery created
- `delivery.updated` - Delivery updated
- `delivery.completed` - Delivery completed

**Consumer:**
- `sale.completed` - Create delivery for completed sale

## Environment Variables

```
PORT=3012
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=delivery_db
DB_SYNCHRONIZE=true
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=delivery-service
```

## Running

### Development

```bash
npm install
npm run start:dev
```

### Production

```bash
npm install
npm run build
npm run start:prod
```

### Docker

```bash
docker-compose up
```

## Database

MySQL database with automatic schema synchronization. Tables:
- `deliveries` - Delivery orders

## Integration

- **Sales Service**: Receives sale.completed events to create deliveries
