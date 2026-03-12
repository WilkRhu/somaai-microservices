# 🚀 START HERE - SomaAI Microservices

## Welcome! 👋

This is your complete guide to get the SomaAI microservices running in 10 minutes.

## ⚡ Quick Start (10 minutes)

### Step 1: Prerequisites Check (1 min)
```bash
# Check Node.js
node --version  # Should be 16+

# Check MySQL
mysql --version  # Should be 8.0+

# Check npm
npm --version
```

### Step 2: Install Dependencies (3 min)
```bash
# Install dependencies for all services
cd services/auth && npm install
cd ../monolith && npm install
cd ../business && npm install
cd ../orchestrator && npm install
```

### Step 3: Initialize Database (1 min)
```bash
# From root directory
node scripts/init-business-db.js
```

### Step 4: Start All Services (3 min)
```bash
# Windows PowerShell
.\scripts\start-all-services-complete.ps1

# Linux/Mac
./scripts/start-all-services.sh
```

### Step 5: Verify Services (2 min)
```bash
# Run integration tests
.\scripts\test-all-services.ps1
```

## 📍 Service URLs

Once running, access these URLs:

| Service | URL | Purpose |
|---------|-----|---------|
| Auth | http://localhost:3010/api/docs | Authentication |
| Monolith | http://localhost:3001/api/docs | Users & Products |
| Business | http://localhost:3011/api/docs | Business Operations |
| Orchestrator | http://localhost:3009/api/docs | API Gateway |

## 🧪 Testing

### Test All Services
```bash
.\scripts\test-all-services.ps1
```

### Test Business Service Only
```bash
.\scripts\test-business-orchestrator-integration.ps1
```

### Manual Test with cURL
```bash
# Create an establishment
curl -X POST http://localhost:3011/api/establishments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Store",
    "cnpj": "12345678000190",
    "email": "store@example.com",
    "phone": "1199999999"
  }'

# List establishments
curl http://localhost:3011/api/establishments

# Via Orchestrator
curl http://localhost:3009/api/business/establishments
```

## 📚 Documentation

### For Quick Help
- **QUICK_START_INTEGRATION.md** - 5-minute setup
- **VERIFICATION_CHECKLIST.md** - Pre-testing checklist

### For Detailed Setup
- **BUSINESS_SERVICE_INTEGRATION_GUIDE.md** - Complete setup guide
- **PROJECT_COMPLETE_STATUS.md** - Full project overview

### For Troubleshooting
- **BUSINESS_SERVICE_FIXES_APPLIED.md** - Technical details
- **PHASE5_SUMMARY.md** - What was fixed

## 🐛 Troubleshooting

### MySQL Connection Error
```
Error: Unknown database 'somaai_business'
```
**Fix**: Run `node scripts/init-business-db.js`

### Service Not Starting
```
Error: listen EADDRINUSE
```
**Fix**: Kill the process using the port or change PORT in .env

### 404 Error from Orchestrator
```
Request failed with status code 404
```
**Fix**: 
1. Verify Business Service is running: `curl http://localhost:3011/api/docs`
2. Check BUSINESS_SERVICE_URL in services/orchestrator/.env

### Database Not Syncing
**Fix**: 
1. Verify `synchronize: true` in service app.module.ts
2. Check database exists: `mysql -u root -e "SHOW DATABASES;"`

## 📊 Architecture

```
Frontend (Port 3000)
        ↓
Orchestrator (Port 3009)
        ↓
┌───────┬───────┬───────┐
│       │       │       │
Auth    Monolith Business
3010    3001    3011
│       │       │
└───────┴───────┴───────┘
        ↓
      MySQL
```

## 🎯 What's Included

### 12 Microservices
- ✅ Auth Service (JWT, Google OAuth)
- ✅ Monolith Service (Users, Products, Purchases)
- ✅ Business Service (Establishments, Customers, Inventory, Sales, Expenses, Suppliers, Offers)
- ✅ Orchestrator (API Gateway)
- ✅ Sales, Inventory, Delivery, Suppliers, Offers, Fiscal, OCR, Payments

### Features
- ✅ RESTful APIs
- ✅ JWT Authentication
- ✅ Google OAuth
- ✅ Kafka Event Streaming
- ✅ TypeORM Database Sync
- ✅ Swagger Documentation
- ✅ CORS Enabled
- ✅ Error Handling

### Databases
- ✅ 11 MySQL databases auto-created
- ✅ 20+ tables auto-created by TypeORM
- ✅ Automatic schema synchronization

## 🔑 Key Endpoints

### Business Service
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

### Via Orchestrator
Same endpoints but prefixed with `/api/business/`

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
  "cpf": "12345678901"
}
```

## ✅ Success Indicators

You'll know everything is working when:
1. ✅ All services start without errors
2. ✅ Swagger docs accessible at all ports
3. ✅ Database tables created automatically
4. ✅ Can create establishments via both direct and Orchestrator routes
5. ✅ Integration tests pass

## 🎓 Learning Resources

- **NestJS**: https://docs.nestjs.com
- **TypeORM**: https://typeorm.io
- **MySQL**: https://dev.mysql.com/doc
- **REST API**: https://restfulapi.net

## 📞 Need Help?

1. **Quick Help**: Check QUICK_START_INTEGRATION.md
2. **Detailed Setup**: Read BUSINESS_SERVICE_INTEGRATION_GUIDE.md
3. **Troubleshooting**: See BUSINESS_SERVICE_FIXES_APPLIED.md
4. **Service Logs**: Check console output when services start
5. **Swagger Docs**: Visit service `/api/docs` endpoints

## 🚀 Next Steps

After getting services running:

1. **Test Endpoints** - Use Postman or cURL
2. **Explore Swagger** - Visit http://localhost:3009/api/docs
3. **Create Sample Data** - Use provided sample data
4. **Implement Features** - Add your business logic
5. **Deploy** - Use Docker Compose for production

## 📋 Checklist

- [ ] Node.js installed (16+)
- [ ] MySQL running
- [ ] Dependencies installed
- [ ] Database initialized
- [ ] All services started
- [ ] Tests passing
- [ ] Swagger docs accessible
- [ ] Ready to develop!

## 🎉 You're All Set!

Your SomaAI microservices are ready to go. Start building! 🚀

---

**Questions?** Check the documentation files or service logs.
**Issues?** See the Troubleshooting section above.
**Ready to code?** Start with the Swagger documentation at http://localhost:3009/api/docs

**Happy coding!** 💻
