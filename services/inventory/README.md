# Inventory Service

Stock management service for SomaAI Microservices. Handles inventory tracking and stock updates.

## Features

- Create and manage inventory items
- Track stock levels
- Monitor low stock alerts
- Automatic stock updates from sales
- Kafka events for inventory changes

## Endpoints

- `POST /api/inventory` - Create inventory item
- `GET /api/inventory/:id` - Get item by ID
- `GET /api/inventory` - List all items
- `PATCH /api/inventory/:id` - Update item
- `DELETE /api/inventory/:id` - Delete item

## Kafka Topics

**Producer:**
- `inventory.updated` - Inventory updated
- `inventory.low_stock_alert` - Low stock alert
- `inventory.restocked` - Item restocked

**Consumer:**
- `sale.created` - Update stock on sale

## Environment Variables

```
PORT=3011
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=inventory_db
DB_SYNCHRONIZE=true
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=inventory-service
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
- `inventory_items` - Stock items

## Integration

- **Sales Service**: Receives sale.created events to update stock
- **Suppliers Service**: Receives restock orders
