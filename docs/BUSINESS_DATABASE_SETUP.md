# Business Database Setup & Business Owner Auto-Creation

## Summary

Configuramos o banco de dados separado para o business service e implementamos o fluxo automático de criação de owner quando um usuário se registra com `business: true`. Além disso, sincronizamos os dados de usuários do auth service para o business service.

## Changes Made

### 1. Database Configuration

**Updated Files:**
- `services/business/.env` - Changed `DB_DATABASE` from `somaai_master` to `somaai_business`
- `docker-compose.yml` - Updated business service environment to use `somaai_business`

**Database Created:**
- `somaai_business` - Banco separado para o business service com as seguintes tabelas:
  - `users` - Sincronização de usuários do auth service
  - `establishments` - Lojas/negócios (com `ownerId` como FK para usuários)
  - `customers` - Clientes
  - `inventory` - Inventário
  - `sales` - Vendas
  - `expenses` - Despesas
  - `suppliers` - Fornecedores
  - `offers` - Ofertas

**Setup Script:**
- `scripts/setup-business-db.js` - Script que cria o banco e as tabelas automaticamente

### 2. User Synchronization

**New Files:**
- `services/business/src/shared/entities/user.entity.ts` - User entity para o business service
- `services/business/src/shared/services/user.service.ts` - Service para gerenciar users no business

**Features:**
- Sincroniza usuários do auth service automaticamente via Kafka
- Mantém dados de email, firstName, lastName, role, phone, avatar
- Suporta atualização de usuários quando dados mudam no auth service

### 3. Business Owner Auto-Creation Flow

**Updated Files:**
- `services/auth/src/auth/dto/register.dto.ts` - Added `business?: boolean` parameter
- `services/auth/src/auth/auth.service.ts` - Updated `register()` method to:
  - Accept `business` flag
  - Set role to `BUSINESS_OWNER` when `business: true`
  - Publish event with correct role

**New Files:**
- `services/business/src/shared/kafka/business.consumer.ts` - Kafka consumer que escuta `user.created` e `user.updated` events
- `services/business/src/shared/kafka/kafka.service.ts` - Kafka service para o business
- `services/business/src/shared/kafka/kafka.module.ts` - Kafka module

**Updated Files:**
- `services/business/src/app.module.ts` - Added KafkaModule

## How It Works

### Registration Flow

```
1. User calls POST /auth/register com { business: true }
   ↓
2. Auth Service cria usuário com role = 'BUSINESS_OWNER'
   ↓
3. Auth Service publica evento Kafka: user.created
   {
     id: "user-id",
     email: "user@example.com",
     firstName: "John",
     lastName: "Doe",
     role: "BUSINESS_OWNER",
     createdAt: "2024-01-01T00:00:00Z"
   }
   ↓
4. Business Service Kafka Consumer recebe o evento
   ↓
5. Business Service sincroniza o usuário na tabela users
   ↓
6. Se role === 'BUSINESS_OWNER':
   - Cria um establishment na tabela establishments
   - ownerId = user.id
   - name = "John Doe's Business"
   - email = user.email
   - isActive = true
```

### Regular User Registration

```
1. User calls POST /auth/register sem business flag (ou business: false)
   ↓
2. Auth Service cria usuário com role = 'USER'
   ↓
3. Auth Service publica evento Kafka: user.created
   ↓
4. Business Service Kafka Consumer recebe o evento
   ↓
5. Business Service sincroniza o usuário na tabela users
   ↓
6. Se role !== 'BUSINESS_OWNER':
   - Ignora o evento (não cria establishment)
```

### User Update Flow

```
1. User updates profile in auth service
   ↓
2. Auth Service publica evento Kafka: user.updated
   ↓
3. Business Service Kafka Consumer recebe o evento
   ↓
4. Business Service atualiza o usuário na tabela users
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  firstName VARCHAR(255) NOT NULL,
  lastName VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'USER',
  phone VARCHAR(20),
  avatar VARCHAR(255),
  isActive BOOLEAN DEFAULT true,
  emailVerified BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastLogin TIMESTAMP NULL
);
```

### Establishments Table
```sql
CREATE TABLE establishments (
  id VARCHAR(36) PRIMARY KEY,
  ownerId VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20) UNIQUE,
  email VARCHAR(255),
  phone VARCHAR(20),
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(2),
  zipCode VARCHAR(10),
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ownerId) REFERENCES users(id)
);
```

## Testing

### 1. Create Business Owner

```bash
curl -X POST http://localhost:3010/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+55 11 99999-9999",
    "business": true
  }'
```

Expected Response:
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {
    "id": "user-id",
    "email": "owner@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "BUSINESS_OWNER",
    "isActive": true
  }
}
```

### 2. Verify User Synced

```bash
# Check in somaai_business database
SELECT * FROM users WHERE email = 'owner@example.com';
```

Expected Result:
```
id: "user-id"
email: "owner@example.com"
firstName: "John"
lastName: "Doe"
role: "BUSINESS_OWNER"
isActive: true
```

### 3. Verify Establishment Created

```bash
# Check in somaai_business database
SELECT * FROM establishments WHERE ownerId = 'user-id';
```

Expected Result:
```
id: "establishment-id"
ownerId: "user-id"
name: "John Doe's Business"
email: "owner@example.com"
isActive: true
```

### 4. Create Regular User

```bash
curl -X POST http://localhost:3010/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+55 11 88888-8888"
  }'
```

Expected: 
- User synced to somaai_business.users
- No establishment created

## Environment Variables

**Business Service (.env):**
```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=somaai
DB_PASSWORD=somaai_password
DB_DATABASE=somaai_business
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=business-service
KAFKA_GROUP_ID=business-group
```

## Next Steps

1. Implement establishment creation endpoint (POST /establishments) for manual creation
2. Add business owner profile management
3. Implement establishment settings and configuration
4. Add role-based access control for business operations
5. Implement business analytics and reporting
6. Add employee management (invite employees to establishment)
7. Implement permission levels for employees

## Troubleshooting

### Kafka Consumer Not Receiving Events

1. Verify Kafka is running: `docker-compose ps kafka`
2. Check Kafka logs: `docker-compose logs kafka`
3. Verify business service is connected to Kafka: Check logs for "Connected to Kafka"
4. Verify topics exist: `docker exec kafka kafka-topics --list --bootstrap-server localhost:9092`

### User Not Synced

1. Check business service logs for Kafka consumer errors
2. Verify user.created event was published by auth service
3. Verify somaai_business.users table exists
4. Check if Kafka consumer is subscribed to user.created topic

### Establishment Not Created

1. Check business service logs for errors
2. Verify user role is 'BUSINESS_OWNER' in somaai_business.users
3. Verify somaai_business.establishments table exists
4. Check Kafka consumer logs for message processing

### Database Connection Issues

1. Verify MySQL is running: `docker-compose ps mysql-master`
2. Check MySQL logs: `docker-compose logs mysql-master`
3. Verify credentials in .env match docker-compose.yml
4. Run setup script again: `node scripts/setup-business-db.js`

