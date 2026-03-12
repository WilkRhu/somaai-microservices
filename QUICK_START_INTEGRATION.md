# Quick Start: Business Service & Orchestrator Integration

## 🚀 Get Running in 5 Minutes

### Prerequisites
- MySQL running on localhost:3306
- Node.js installed
- All dependencies installed (`npm install` in each service)

### Step 1: Initialize Database (1 minute)
```bash
# Option A: Using Node.js script
node scripts/init-business-db.js

# Option B: Using SQL
mysql -u root < scripts/init-databases.sql
```

### Step 2: Start Business Service (1 minute)
```bash
cd services/business
npm run start:dev
```

Wait for:
```
Business Service running on port 3011
Swagger docs available at http://localhost:3011/api/docs
```

### Step 3: Start Orchestrator (1 minute)
In a new terminal:
```bash
cd services/orchestrator
npm run start:dev
```

Wait for:
```
Orchestrator running on port 3009
```

### Step 4: Test Integration (2 minutes)

#### Option A: PowerShell Script
```bash
.\scripts\test-business-orchestrator-integration.ps1
```

#### Option B: Manual cURL Tests

**Create Establishment (Direct)**
```bash
curl -X POST http://localhost:3011/api/establishments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Store",
    "cnpj": "12345678000190",
    "email": "store@example.com",
    "phone": "1199999999"
  }'
```

**Create Establishment (Via Orchestrator)**
```bash
curl -X POST http://localhost:3009/api/business/establishments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Store 2",
    "cnpj": "12345678000191",
    "email": "store2@example.com",
    "phone": "1199999998"
  }'
```

**List Establishments**
```bash
# Direct
curl http://localhost:3011/api/establishments

# Via Orchestrator
curl http://localhost:3009/api/business/establishments
```

## 📊 Available Endpoints

### Business Service (Port 3011)
```
POST   /api/establishments
GET    /api/establishments
GET    /api/establishments/:id
PUT    /api/establishments/:id
DELETE /api/establishments/:id

POST   /api/customers
GET    /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id

POST   /api/inventory
GET    /api/inventory
GET    /api/inventory/:id
PUT    /api/inventory/:id
DELETE /api/inventory/:id

POST   /api/sales
GET    /api/sales
GET    /api/sales/:id
PUT    /api/sales/:id
DELETE /api/sales/:id

POST   /api/expenses
GET    /api/expenses
GET    /api/expenses/:id
PATCH  /api/expenses/:id
DELETE /api/expenses/:id

POST   /api/suppliers
GET    /api/suppliers
GET    /api/suppliers/:id
PATCH  /api/suppliers/:id
DELETE /api/suppliers/:id

POST   /api/offers
GET    /api/offers
GET    /api/offers/:id
PATCH  /api/offers/:id
DELETE /api/offers/:id
```

### Via Orchestrator (Port 3009)
Same endpoints but prefixed with `/api/business`:
```
POST   /api/business/establishments
GET    /api/business/establishments
... etc
```

## 🔍 Verify Everything Works

### Check Services Running
```bash
# Business Service
curl http://localhost:3011/api/docs

# Orchestrator
curl http://localhost:3009/api/docs
```

### Check Database
```bash
mysql -u root -e "USE somaai_business; SHOW TABLES;"
```

Expected tables:
```
establishments
customers
inventory_items
sales
sale_items
expenses
suppliers
purchase_orders
offers
offer_notifications
```

## 📝 Sample Data

### Create Establishment
```json
{
  "name": "Loja Principal",
  "cnpj": "12345678000190",
  "email": "loja@example.com",
  "phone": "1199999999",
  "address": "Rua Principal, 123",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01234-567"
}
```

### Create Customer
```json
{
  "establishmentId": "uuid-from-establishment",
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "1188888888",
  "cpf": "12345678901",
  "address": "Rua Secundária, 456",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01234-568"
}
```

### Create Inventory Item
```json
{
  "establishmentId": "uuid-from-establishment",
  "name": "Produto A",
  "sku": "SKU-001",
  "quantity": 100,
  "minQuantity": 10,
  "price": 29.99,
  "unit": "UNIT"
}
```

### Create Sale
```json
{
  "establishmentId": "uuid-from-establishment",
  "customerId": "uuid-from-customer",
  "totalAmount": 99.99,
  "status": "COMPLETED",
  "saleDate": "2026-03-12"
}
```

## 🐛 Troubleshooting

### Database Connection Error
```
Error: Unknown database 'somaai_business'
```
**Fix**: Run `node scripts/init-business-db.js`

### 404 Error from Orchestrator
```
Request failed with status code 404
```
**Fix**: 
1. Verify Business Service is running: `curl http://localhost:3011/api/docs`
2. Check `BUSINESS_SERVICE_URL=http://localhost:3011` in Orchestrator .env

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3011
```
**Fix**: Kill the process using the port or change PORT in .env

### TypeORM Synchronization Issues
**Fix**: 
1. Verify `synchronize: true` in `services/business/src/app.module.ts`
2. Check database exists: `mysql -u root -e "SHOW DATABASES;"`
3. Enable logging: Set `DB_LOGGING=true` in .env

## 📚 Documentation

- **Full Setup Guide**: `BUSINESS_SERVICE_INTEGRATION_GUIDE.md`
- **Fixes Applied**: `BUSINESS_SERVICE_FIXES_APPLIED.md`
- **Architecture**: `docs/FRONTEND_BACKEND_ARCHITECTURE.md`
- **Entities**: `docs/ALL_ENTITIES_DOCUMENTATION.md`

## ✅ Success Indicators

You'll know everything is working when:
1. ✅ Both services start without errors
2. ✅ Database tables are created automatically
3. ✅ Swagger docs are accessible at both ports
4. ✅ You can create establishments via both direct and Orchestrator routes
5. ✅ You can list all resources
6. ✅ CRUD operations work for all modules

## 🎯 Next Steps

1. Add JWT authentication
2. Implement Kafka event publishing
3. Add comprehensive error handling
4. Create validation DTOs
5. Set up monitoring with Prometheus/Grafana
6. Deploy to production

---

**Status**: ✅ Ready for Testing
**Last Updated**: March 12, 2026
