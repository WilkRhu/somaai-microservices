# Business Service Setup Guide 🚀

## Prerequisites

1. **MySQL Database** running on `localhost:3306`
2. **Node.js 18+** installed
3. **Kafka** running on `localhost:9092` (optional for local testing)

---

## Step 1: Create Database

Run the initialization script to create the `somaai_business` database:

### Windows (PowerShell)
```powershell
mysql -u root < scripts/init-databases.sql
```

### Linux/Mac
```bash
mysql -u root < scripts/init-databases.sql
```

Or manually in MySQL:
```sql
CREATE DATABASE IF NOT EXISTS somaai_business;
```

---

## Step 2: Install Dependencies

```bash
cd services/business
npm install
# or
yarn install
```

---

## Step 3: Configure Environment

The `.env` file is already created with default values:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=somaai_business
PORT=3011
```

**Update if needed** based on your MySQL configuration.

---

## Step 4: Start the Service

### Development Mode
```bash
cd services/business
npm run start:dev
```

### Production Mode
```bash
cd services/business
npm run build
npm run start:prod
```

---

## Step 5: Verify Service is Running

The Business Service should be running on `http://localhost:3011`

Check health:
```bash
curl http://localhost:3011
```

---

## API Endpoints

All endpoints are prefixed with `/api/`:

### Establishments
- `POST /api/establishments` - Create establishment
- `GET /api/establishments` - List establishments
- `GET /api/establishments/:id` - Get establishment
- `PUT /api/establishments/:id` - Update establishment
- `DELETE /api/establishments/:id` - Delete establishment

### Customers
- `POST /api/customers` - Create customer
- `GET /api/customers` - List customers
- `GET /api/customers/:id` - Get customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Inventory
- `POST /api/inventory` - Create inventory item
- `GET /api/inventory` - List inventory
- `GET /api/inventory/:id` - Get inventory item
- `PUT /api/inventory/:id` - Update inventory
- `DELETE /api/inventory/:id` - Delete inventory

### Sales
- `POST /api/sales` - Create sale
- `GET /api/sales` - List sales
- `GET /api/sales/:id` - Get sale
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale

### Expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses` - List expenses
- `GET /api/expenses/:id` - Get expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Suppliers
- `POST /api/suppliers` - Create supplier
- `GET /api/suppliers` - List suppliers
- `GET /api/suppliers/:id` - Get supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

### Offers
- `POST /api/offers` - Create offer
- `GET /api/offers` - List offers
- `GET /api/offers/:id` - Get offer
- `PUT /api/offers/:id` - Update offer
- `DELETE /api/offers/:id` - Delete offer

---

## Database Tables (Auto-created by TypeORM)

The following tables are automatically created when the service starts:

- `establishments` - Business establishments
- `customers` - Business customers
- `inventory_items` - Inventory management
- `sales` - Sales records
- `expenses` - Expense tracking
- `suppliers` - Supplier information
- `purchase_orders` - Purchase orders
- `offers` - Business offers

---

## Troubleshooting

### Error: "Unknown database 'somaai_business'"
**Solution**: Run the initialization script to create the database:
```bash
mysql -u root < scripts/init-databases.sql
```

### Error: "Connection refused"
**Solution**: Ensure MySQL is running:
```bash
# Windows
net start MySQL80

# Linux
sudo systemctl start mysql

# Mac
brew services start mysql
```

### Error: "Port 3011 already in use"
**Solution**: Change the PORT in `.env` file or kill the process using port 3011

---

## Next Steps

1. ✅ Database created
2. ✅ Service configured
3. ✅ Service running
4. 🔄 **Next**: Integrate with Orchestrator (port 3009)
5. 🔄 **Next**: Add authentication guards
6. 🔄 **Next**: Implement business logic

---

## Support

For issues or questions, check:
- `docs/BUSINESS_SERVICE_COMPLETE.md` - Complete documentation
- `BUSINESS_SERVICE_IMPLEMENTATION_SUMMARY.md` - Implementation details
- `PHASE4_FINAL_REPORT.md` - Phase 4 summary
