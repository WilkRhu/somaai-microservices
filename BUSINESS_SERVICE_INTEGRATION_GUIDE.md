# Business Service Integration Guide

## Overview
This guide covers setting up and testing the Business Service integration with the Orchestrator. The Business Service runs on port 3011 and handles all business operations (establishments, customers, inventory, sales, expenses, suppliers, offers).

## Prerequisites
- MySQL running on localhost:3306
- Node.js and npm installed
- All services dependencies installed

## Step 1: Database Setup

### Option A: Using SQL Script (Recommended)
```bash
# Connect to MySQL and run the initialization script
mysql -u root < scripts/init-databases.sql
```

### Option B: Using Node.js Script
```bash
# From the root directory
node scripts/init-business-db.js
```

This will create the `somaai_business` database. TypeORM will automatically create all tables on first startup.

## Step 2: Environment Configuration

### Business Service (.env)
Verify `services/business/.env` has:
```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=somaai_business
PORT=3011
NODE_ENV=development
KAFKA_BROKERS=localhost:9092
```

### Orchestrator (.env)
Verify `services/orchestrator/.env` has:
```
BUSINESS_SERVICE_URL=http://localhost:3011
PORT=3009
```

## Step 3: Start Services

### Start Business Service
```bash
cd services/business
npm install  # if not already done
npm run start:dev
```

Expected output:
```
[Nest] 12345  - 12/03/2026, 15:40:00   LOG [NestFactory] Starting Nest application...
Business Service running on port 3011
Swagger docs available at http://localhost:3011/api/docs
```

### Start Orchestrator (in another terminal)
```bash
cd services/orchestrator
npm install  # if not already done
npm run start:dev
```

Expected output:
```
[Nest] 12346  - 12/03/2026, 15:40:05   LOG [NestFactory] Starting Nest application...
Orchestrator running on port 3009
```

## Step 4: Verify Services

### Check Business Service Health
```bash
curl http://localhost:3011/api/docs
```

### Check Orchestrator Health
```bash
curl http://localhost:3009/api/docs
```

## Step 5: Test Integration

### Direct Business Service Test
```bash
# Create an establishment directly
curl -X POST http://localhost:3011/api/establishments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Establishment",
    "cnpj": "12345678000190",
    "email": "test@example.com",
    "phone": "1199999999"
  }'
```

### Via Orchestrator Test
```bash
# Create an establishment through Orchestrator
curl -X POST http://localhost:3009/api/business/establishments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Establishment via Orchestrator",
    "cnpj": "12345678000191",
    "email": "test2@example.com",
    "phone": "1199999998"
  }'
```

## API Routes

### Business Service Direct Routes (Port 3011)
- **Establishments**: `POST/GET/PUT/DELETE /api/establishments`
- **Customers**: `POST/GET/PUT/DELETE /api/customers`
- **Inventory**: `POST/GET/PUT/DELETE /api/inventory`
- **Sales**: `POST/GET/PUT/DELETE /api/sales`
- **Expenses**: `POST/GET/PATCH/DELETE /api/expenses`
- **Suppliers**: `POST/GET/PATCH/DELETE /api/suppliers`
- **Offers**: `POST/GET/PATCH/DELETE /api/offers`

### Via Orchestrator (Port 3009)
- **Establishments**: `POST/GET/PUT/DELETE /api/business/establishments`
- **Customers**: `POST/GET/PUT/DELETE /api/business/customers`
- **Inventory**: `POST/GET/PUT/DELETE /api/business/inventory`
- **Sales**: `POST/GET/PUT/DELETE /api/business/sales`
- **Expenses**: `POST/GET/PUT/DELETE /api/business/expenses`
- **Suppliers**: `POST/GET/PUT/DELETE /api/business/suppliers`
- **Offers**: `POST/GET/PUT/DELETE /api/business/offers`

## Troubleshooting

### Database Connection Error
```
Error: Unknown database 'somaai_business'
```
**Solution**: Run the database initialization script:
```bash
node scripts/init-business-db.js
```

### 404 Error from Orchestrator
```
Request failed with status code 404
```
**Solution**: 
1. Verify Business Service is running on port 3011
2. Check that all controller routes have `/api/` prefix
3. Verify `BUSINESS_SERVICE_URL` in Orchestrator .env

### TypeORM Synchronization Issues
If tables aren't being created:
1. Check `synchronize: true` in `services/business/src/app.module.ts`
2. Verify database exists: `mysql -u root -e "SHOW DATABASES;"`
3. Check TypeORM logs: Set `DB_LOGGING=true` in .env

## Database Schema

The Business Service automatically creates these tables via TypeORM:
- `establishments` - Business establishments
- `customers` - Customer records
- `inventory_items` - Inventory products
- `sales` - Sales transactions
- `sale_items` - Individual items in sales
- `expenses` - Business expenses
- `suppliers` - Supplier information
- `purchase_orders` - Purchase orders from suppliers
- `offers` - Business offers/promotions
- `offer_notifications` - Notifications for offers

## Next Steps

1. **Test all endpoints** using Postman collection: `postman-business-service.json`
2. **Implement authentication** with JWT tokens from Auth Service
3. **Add Kafka event publishing** for business events
4. **Set up monitoring** with Prometheus and Grafana
5. **Deploy to production** using Docker Compose

## Support

For issues or questions:
1. Check `TROUBLESHOOTING.md` in docs folder
2. Review service logs: `npm run logs` (if available)
3. Check Swagger documentation at service `/api/docs` endpoints
