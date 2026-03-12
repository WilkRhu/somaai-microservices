# Sales Service

Sales management service for SomaAI Microservices. Handles creation, update, and tracking of sales orders.

## Features

- Create and manage sales orders
- Track order status (pending, confirmed, completed, cancelled)
- Apply discounts from offers
- Integrate with inventory service for stock updates
- Kafka events for order lifecycle

## Endpoints

- `POST /api/sales` - Create a new sale
- `GET /api/sales/:id` - Get sale by ID
- `GET /api/sales` - List all sales (with filters)
- `PATCH /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Cancel sale

## Kafka Topics

**Producer:**
- `sale.created` - Sale created
- `sale.updated` - Sale updated
- `sale.completed` - Sale completed
- `sale.cancelled` - Sale cancelled

**Consumer:**
- `offer.created` - Apply new offers
- `inventory.updated` - Stock updates

## Environment Variables

```
PORT=3010
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=sales_db
DB_SYNCHRONIZE=true
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=sales-service
INVENTORY_SERVICE_URL=http://localhost:3011
OFFERS_SERVICE_URL=http://localhost:3014
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
- `sales` - Sales orders

## Integration

- **Inventory Service**: Updates stock when sale is created
- **Offers Service**: Applies discounts to sales
