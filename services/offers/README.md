# Offers Service

Promotions and offers management service for SomaAI Microservices. Handles discount campaigns and promotional offers.

## Features

- Create and manage promotional offers
- Track offer status (active, inactive, expired)
- Set discount percentages and date ranges
- Kafka events for offer lifecycle
- Integration with sales for discount application

## Endpoints

- `POST /api/offers` - Create offer
- `GET /api/offers/:id` - Get offer by ID
- `GET /api/offers` - List offers (with filters)
- `PATCH /api/offers/:id` - Update offer
- `DELETE /api/offers/:id` - Delete offer

## Kafka Topics

**Producer:**
- `offer.created` - Offer created
- `offer.updated` - Offer updated
- `offer.deleted` - Offer deleted

**Consumer:**
- `sale.created` - Apply offer to sale

## Environment Variables

```
PORT=3014
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=offers_db
DB_SYNCHRONIZE=true
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=offers-service
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
- `offers` - Promotional offers

## Integration

- **Sales Service**: Receives sale.created events to apply discounts
