# Quick Start - Complete Docker Setup

## Prerequisites
- Docker and Docker Compose installed
- Git repository cloned
- `.env` file configured with API keys

## Step 1: Configure Environment Variables

### Root .env
Create or update `.env` in the project root:

```bash
# SendGrid API Key (required for email service)
SENDGRID_API_KEY=your-sendgrid-api-key-here

# Optional: Other service API keys
MERCADOPAGO_ACCESS_TOKEN=your-token
FOCUS_NFE_API_TOKEN=your-token
```

### Service-Specific .env Files
Each service already has `.env` files configured with:
- Database credentials (production: 193.203.175.121)
- SMTP credentials (Hostinger)
- Kafka configuration
- JWT secrets

## Step 2: Start All Services

### Option A: Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Option B: Using PowerShell Script (Windows)

```powershell
# Start all services
.\scripts\start-all-services.ps1

# Stop all services
.\scripts\stop-all-services.ps1
```

### Option C: Using Bash Script (Linux/Mac)

```bash
# Start all services
./scripts/start-all-services.sh

# Stop all services
./scripts/stop-all-services.sh
```

## Step 3: Verify Services Are Running

### Check Service Health

```bash
# Check all services
curl http://localhost:3009/health

# Check individual services
curl http://localhost:3000/health  # Auth
curl http://localhost:3001/health  # Sales
curl http://localhost:3002/health  # Inventory
curl http://localhost:3003/health  # Delivery
curl http://localhost:3004/health  # Suppliers
curl http://localhost:3005/health  # Offers
curl http://localhost:3006/health  # Fiscal
curl http://localhost:3007/health  # OCR
curl http://localhost:3008/health  # Payments
curl http://localhost:3009/health  # Orchestrator
curl http://localhost:3010/health  # Monolith
curl http://localhost:3011/health  # Business
curl http://localhost:3012/health  # Email
```

### View Running Containers

```bash
docker ps
```

Expected output should show all services running.

## Step 4: Access Services

### Frontend Access (Recommended)
All frontend requests should go through the Orchestrator:

```
http://localhost:3009
```

### Available Endpoints Through Orchestrator

#### Authentication
```
POST   /auth/login
POST   /auth/register
POST   /auth/refresh
```

#### Business
```
POST   /business/establishments
GET    /business/establishments
GET    /business/establishments/:id
```

#### Sales
```
POST   /sales/orders
GET    /sales/orders
GET    /sales/orders/:id
```

#### Inventory
```
POST   /inventory/products
GET    /inventory/products
GET    /inventory/products/:id
```

#### Payments
```
POST   /payments/transactions
GET    /payments/transactions/:id
```

#### Fiscal
```
POST   /fiscal/nfce
GET    /fiscal/nfce/:id
```

#### OCR
```
POST   /ocr/process
GET    /ocr/results/:id
```

#### Email
```
POST   /email/send
POST   /email/send-bulk
GET    /email/:id
```

#### Delivery
```
POST   /delivery/shipments
GET    /delivery/shipments/:id
```

#### Suppliers
```
POST   /suppliers
GET    /suppliers
GET    /suppliers/:id
```

#### Offers
```
POST   /offers
GET    /offers
GET    /offers/:id
```

## Step 5: Monitor Services

### Kafka UI
```
http://localhost:8080
```

### Docker Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f email
docker-compose logs -f orchestrator
docker-compose logs -f business
```

### Database Access
```
Host: 193.203.175.121
Port: 3306
Username: u752511550_user_business
Password: @Wilk2026#
Database: u752511550_somaai_busines
```

## Step 6: Test Email Service

### Send Test Email
```bash
curl -X POST http://localhost:3009/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "template": "user-welcome",
    "data": {
      "userName": "Test User"
    }
  }'
```

### Check Email Status
```bash
curl http://localhost:3009/email/{emailId}
```

## Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Port 3000)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              Orchestrator (Port 3009)                        │
│  Single entry point for all microservices                   │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
    ┌────────┐      ┌────────┐      ┌────────┐
    │  Auth  │      │Business│      │ Sales  │
    │ 3000   │      │ 3011   │      │ 3001   │
    └────────┘      └────────┘      └────────┘
        ↓                ↓                ↓
    ┌────────┐      ┌────────┐      ┌────────┐
    │Inventory│      │Delivery│      │Suppliers│
    │ 3002   │      │ 3003   │      │ 3004   │
    └────────┘      └────────┘      └────────┘
        ↓                ↓                ↓
    ┌────────┐      ┌────────┐      ┌────────┐
    │ Offers │      │ Fiscal │      │  OCR   │
    │ 3005   │      │ 3006   │      │ 3007   │
    └────────┘      └────────┘      └────────┘
        ↓                ↓                ↓
    ┌────────┐      ┌────────┐      ┌────────┐
    │Payments│      │ Email  │      │Monolith│
    │ 3008   │      │ 3012   │      │ 3010   │
    └────────┘      └────────┘      └────────┘
        ↓                ↓                ↓
    └────────────────────┬────────────────┘
                         ↓
        ┌────────────────────────────────┐
        │  Shared Infrastructure         │
        │  ├─ MySQL (193.203.175.121)   │
        │  ├─ Redis (6379)              │
        │  ├─ Kafka (9092-9094)         │
        │  └─ Zookeeper (2181)          │
        └────────────────────────────────┘
```

## Troubleshooting

### Services Not Starting
```bash
# Check Docker daemon
docker ps

# Check logs
docker-compose logs

# Rebuild images
docker-compose build --no-cache

# Start fresh
docker-compose down -v
docker-compose up -d
```

### Database Connection Issues
```bash
# Verify database is accessible
mysql -h 193.203.175.121 -u u752511550_user_business -p

# Check service logs
docker-compose logs email
docker-compose logs business
```

### Port Already in Use
```bash
# Find process using port
lsof -i :3009

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Email Service Not Sending
```bash
# Check SendGrid API key
echo $SENDGRID_API_KEY

# Check SMTP fallback
docker-compose logs email

# Verify email configuration
curl http://localhost:3009/email/health
```

## Performance Tips

1. **Use Production Database**
   - Already configured at 193.203.175.121
   - Shared across all services

2. **Enable Caching**
   - Redis is running on port 6379
   - Services use Redis for caching

3. **Monitor Kafka**
   - Kafka UI available at http://localhost:8080
   - Monitor message flow and topics

4. **Database Optimization**
   - Use indexes on frequently queried fields
   - Monitor slow queries

## Next Steps

1. **Configure API Keys**
   - SendGrid for email
   - Mercado Pago for payments
   - Focus NFE for fiscal

2. **Set Up Frontend**
   - Clone frontend repository
   - Configure API endpoint: `http://localhost:3009`
   - Start frontend development server

3. **Run Integration Tests**
   ```bash
   npm run test:integration
   ```

4. **Deploy to Production**
   - See `docs/DEPLOYMENT_GUIDE.md`
   - Configure production environment variables
   - Set up CI/CD pipeline

## Support

For issues or questions:
1. Check service logs: `docker-compose logs -f {service}`
2. Review documentation in `docs/` folder
3. Check Kafka UI for message flow: http://localhost:8080
4. Verify database connectivity

## Summary

✅ All 13 microservices running
✅ Orchestrator routing configured
✅ Email service integrated
✅ Database connected
✅ Kafka messaging ready
✅ Redis caching enabled
✅ Frontend accessible via port 3009
