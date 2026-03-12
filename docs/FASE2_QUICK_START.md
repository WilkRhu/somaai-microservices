# Fase 2 - Quick Start Guide

## Overview

Fase 2 introduces 5 business services for SomaAI microservices architecture. Each service is independently deployable and communicates via Kafka.

## Services at a Glance

| Service | Port | Purpose | Database |
|---------|------|---------|----------|
| Sales | 3010 | Manage sales orders | sales_db |
| Inventory | 3011 | Track stock levels | inventory_db |
| Delivery | 3012 | Track shipments | delivery_db |
| Suppliers | 3013 | Manage suppliers | suppliers_db |
| Offers | 3014 | Manage promotions | offers_db |

## Quick Start - Local Development

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- MySQL 8.0
- Kafka 7.5.0

### Option 1: Run Individual Service

```bash
# Sales Service
cd services/sales
npm install
npm run start:dev
# Service runs on http://localhost:3010

# In another terminal - Inventory Service
cd services/inventory
npm install
npm run start:dev
# Service runs on http://localhost:3011

# Repeat for other services (delivery, suppliers, offers)
```

### Option 2: Run with Docker Compose

```bash
# Sales Service
cd services/sales
docker-compose up

# In another terminal - Inventory Service
cd services/inventory
docker-compose up

# Repeat for other services
```

## API Examples

### Sales Service

```bash
# Create a sale
curl -X POST http://localhost:3010/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust-123",
    "totalAmount": 100.00,
    "items": [
      {
        "productId": "prod-1",
        "quantity": 2,
        "unitPrice": 50.00
      }
    ]
  }'

# Get sale
curl http://localhost:3010/api/sales/[sale-id]

# List sales
curl http://localhost:3010/api/sales

# Update sale
curl -X PATCH http://localhost:3010/api/sales/[sale-id] \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'

# Delete sale
curl -X DELETE http://localhost:3010/api/sales/[sale-id]
```

### Inventory Service

```bash
# Create inventory item
curl -X POST http://localhost:3011/api/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod-1",
    "quantity": 100,
    "minQuantity": 10,
    "maxQuantity": 500
  }'

# Get item
curl http://localhost:3011/api/inventory/[item-id]

# List items
curl http://localhost:3011/api/inventory

# Update item
curl -X PATCH http://localhost:3011/api/inventory/[item-id] \
  -H "Content-Type: application/json" \
  -d '{"quantity": 95}'

# Delete item
curl -X DELETE http://localhost:3011/api/inventory/[item-id]
```

### Delivery Service

```bash
# Create delivery
curl -X POST http://localhost:3012/api/deliveries \
  -H "Content-Type: application/json" \
  -d '{
    "saleId": "sale-123",
    "estimatedDate": "2026-03-20T10:00:00Z"
  }'

# Get delivery
curl http://localhost:3012/api/deliveries/[delivery-id]

# List deliveries
curl http://localhost:3012/api/deliveries

# Update delivery
curl -X PATCH http://localhost:3012/api/deliveries/[delivery-id] \
  -H "Content-Type: application/json" \
  -d '{"status": "in_transit"}'

# Track delivery
curl -X POST http://localhost:3012/api/deliveries/[delivery-id]/track
```

### Suppliers Service

```bash
# Create supplier
curl -X POST http://localhost:3013/api/suppliers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Supplier Inc",
    "cnpj": "12.345.678/0001-90",
    "email": "contact@supplier.com",
    "phone": "+55 11 98765-4321",
    "address": "Rua Principal, 123"
  }'

# Get supplier
curl http://localhost:3013/api/suppliers/[supplier-id]

# List suppliers
curl http://localhost:3013/api/suppliers

# Update supplier
curl -X PATCH http://localhost:3013/api/suppliers/[supplier-id] \
  -H "Content-Type: application/json" \
  -d '{"phone": "+55 11 99999-9999"}'

# Delete supplier
curl -X DELETE http://localhost:3013/api/suppliers/[supplier-id]
```

### Offers Service

```bash
# Create offer
curl -X POST http://localhost:3014/api/offers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Spring Sale",
    "description": "20% off all items",
    "discountPercentage": 20,
    "startDate": "2026-03-01T00:00:00Z",
    "endDate": "2026-03-31T23:59:59Z"
  }'

# Get offer
curl http://localhost:3014/api/offers/[offer-id]

# List offers
curl http://localhost:3014/api/offers

# Update offer
curl -X PATCH http://localhost:3014/api/offers/[offer-id] \
  -H "Content-Type: application/json" \
  -d '{"status": "inactive"}'

# Delete offer
curl -X DELETE http://localhost:3014/api/offers/[offer-id]
```

## Kafka Topics

Each service publishes events to Kafka topics:

### Sales Topics
- `sale.created` - New sale created
- `sale.updated` - Sale updated
- `sale.completed` - Sale completed
- `sale.cancelled` - Sale cancelled

### Inventory Topics
- `inventory.updated` - Stock updated
- `inventory.low_stock_alert` - Low stock warning
- `inventory.restocked` - Item restocked

### Delivery Topics
- `delivery.created` - Delivery created
- `delivery.updated` - Delivery updated
- `delivery.completed` - Delivery completed

### Suppliers Topics
- `supplier.created` - Supplier created
- `supplier.updated` - Supplier updated
- `supplier.deleted` - Supplier deleted

### Offers Topics
- `offer.created` - Offer created
- `offer.updated` - Offer updated
- `offer.deleted` - Offer deleted

## Environment Setup

Each service needs a `.env` file. Copy from `.env.example`:

```bash
cd services/sales
cp .env.example .env
# Edit .env with your configuration
```

Default values:
```
NODE_ENV=development
PORT=3010
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=sales_db
DB_SYNCHRONIZE=true
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=sales-service
```

## Database Setup

Services use MySQL with automatic schema synchronization. No manual migrations needed.

```bash
# MySQL will be created automatically by docker-compose
# Or connect manually:
mysql -h localhost -u root -p

# Create databases (optional, auto-created):
CREATE DATABASE sales_db;
CREATE DATABASE inventory_db;
CREATE DATABASE delivery_db;
CREATE DATABASE suppliers_db;
CREATE DATABASE offers_db;
```

## Kafka Setup

Kafka is included in docker-compose. Topics are created automatically on first message.

```bash
# Check Kafka topics (if needed):
docker exec kafka kafka-topics --list --bootstrap-server localhost:9092

# Create topic manually (optional):
docker exec kafka kafka-topics --create \
  --topic sale.created \
  --bootstrap-server localhost:9092
```

## Testing

Each service includes Jest configuration:

```bash
cd services/sales

# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

## Linting & Formatting

```bash
cd services/sales

# Lint code
npm run lint

# Format code
npm run format
```

## Building for Production

```bash
cd services/sales

# Build
npm run build

# Run production build
npm run start:prod
```

## Docker Build

```bash
cd services/sales

# Build image
docker build -t somaai-sales-service:1.0.0 .

# Run container
docker run -p 3010:3010 \
  -e DB_HOST=mysql \
  -e KAFKA_BROKERS=kafka:9092 \
  somaai-sales-service:1.0.0
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :3010

# Kill process
kill -9 [PID]
```

### Database Connection Error
```bash
# Check MySQL is running
docker ps | grep mysql

# Check credentials in .env
cat .env | grep DB_
```

### Kafka Connection Error
```bash
# Check Kafka is running
docker ps | grep kafka

# Check broker address
echo $KAFKA_BROKERS
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Common Commands

```bash
# Start service in development
npm run start:dev

# Start service in debug mode
npm run start:debug

# Build service
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Start with Docker
docker-compose up

# Stop Docker containers
docker-compose down

# View Docker logs
docker-compose logs -f
```

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         API Gateway (Nginx)             │
│              Port 80                    │
└────────────────────┬────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
    ┌───▼──┐    ┌───▼──┐    ┌───▼──┐
    │Sales │    │Invent│    │Deliv │
    │3010  │    │3011  │    │3012  │
    └───┬──┘    └───┬──┘    └───┬──┘
        │            │            │
        └────────────┼────────────┘
                     │
            ┌────────▼────────┐
            │  Kafka Broker   │
            │    Port 9092    │
            └────────┬────────┘
                     │
            ┌────────▼────────┐
            │ MySQL Database  │
            │   Port 3306     │
            └─────────────────┘
```

## Next Steps

1. **Run all services** - Start each service in separate terminals
2. **Test APIs** - Use curl or Postman to test endpoints
3. **Monitor Kafka** - Watch events flow between services
4. **Check databases** - Verify data persistence
5. **Review logs** - Check service logs for issues

## Documentation

- Full documentation: `docs/FASE2_COMPLETA.md`
- Service README: `services/[service]/README.md`
- API examples: See above

## Support

For issues or questions:
1. Check service README
2. Review logs: `docker-compose logs -f`
3. Check database: `mysql -u root -p [database]`
4. Check Kafka: `docker exec kafka kafka-topics --list --bootstrap-server localhost:9092`

---

**Happy coding! 🚀**
