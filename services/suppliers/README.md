# Suppliers Service

Supplier management service for SomaAI Microservices. Handles supplier information and management.

## Features

- Create and manage suppliers
- Store supplier contact information
- Track supplier details (CNPJ, email, phone, address)
- Kafka events for supplier lifecycle
- Integration with inventory for restocking

## Endpoints

- `POST /api/suppliers` - Create supplier
- `GET /api/suppliers/:id` - Get supplier by ID
- `GET /api/suppliers` - List suppliers (with filters)
- `PATCH /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

## Kafka Topics

**Producer:**
- `supplier.created` - Supplier created
- `supplier.updated` - Supplier updated
- `supplier.deleted` - Supplier deleted

**Consumer:**
- `inventory.low_stock_alert` - Create restock order

## Environment Variables

```
PORT=3013
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=suppliers_db
DB_SYNCHRONIZE=true
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=suppliers-service
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
- `suppliers` - Supplier information

## Integration

- **Inventory Service**: Receives low_stock_alert events to create restock orders
