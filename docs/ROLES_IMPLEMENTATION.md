# Roles Implementation - Monolith & Business Service

## Summary

Implementamos a estrutura de roles definida no documento `ROLES_AND_PERMISSIONS copy.md` em ambos os serviços (monolith e business).

## Changes Made

### 1. Monolith Service

**Updated Files:**
- `services/monolith/src/users/entities/user.entity.ts` - Changed role enum to use lowercase values

**New Files:**
- `services/monolith/src/shared/enums/user-role.enum.ts` - UserRole enum

**User Roles (Global):**
```typescript
export enum UserRole {
  USER = 'user',
  SUPPORT = 'support',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}
```

### 2. Business Service

**Updated Files:**
- `services/business/src/shared/enums/establishment-role.enum.ts` - Updated to use correct business roles
- `services/business/src/shared/kafka/business.consumer.ts` - Updated to create establishment_user records
- `services/business/src/shared/kafka/kafka.module.ts` - Added EstablishmentUser to imports
- `scripts/setup-business-db.js` - Added establishment_users table

**New Files:**
- `services/business/src/shared/entities/establishment-user.entity.ts` - EstablishmentUser entity

**Business Roles (Establishment-specific):**
```typescript
export enum BusinessRole {
  OWNER = 'business_owner',
  ADMIN = 'business_admin',
  SALES = 'business_sales',
  STOCK = 'business_stock',
  MARKETING = 'business_marketing',
}
```

### 3. Auth Service

**Updated Files:**
- `services/auth/src/auth/auth.service.ts` - Changed role assignment to use lowercase 'business_owner' and 'user'

## Database Schema

### Monolith - Users Table
```sql
role ENUM('user', 'support', 'admin', 'super_admin') DEFAULT 'user'
```

### Business - Users Table
```sql
role VARCHAR(50) DEFAULT 'user'
```

### Business - Establishment Users Table (NEW)
```sql
CREATE TABLE establishment_users (
  id VARCHAR(36) PRIMARY KEY,
  establishmentId VARCHAR(36) NOT NULL,
  userId VARCHAR(36) NOT NULL,
  role VARCHAR(50) NOT NULL,  -- business_owner, business_admin, business_sales, business_stock, business_marketing
  invitedBy VARCHAR(36),
  invitedAt TIMESTAMP,
  acceptedAt TIMESTAMP,
  status VARCHAR(50) DEFAULT 'ACTIVE',  -- ACTIVE, INACTIVE, PENDING
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (establishmentId) REFERENCES establishments(id),
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (invitedBy) REFERENCES users(id),
  UNIQUE KEY unique_establishment_user (establishmentId, userId)
);
```

## Role Hierarchy & Permissions

### Business Role Hierarchy
```
OWNER (5)
  ↓
ADMIN (4)
  ↓
SALES, STOCK, MARKETING (2)
```

### Business Role Permissions

#### OWNER (business_owner)
- manage_establishment
- manage_users
- manage_settings
- manage_billing
- manage_sales
- manage_inventory
- manage_customers
- manage_suppliers
- manage_offers
- manage_expenses
- view_analytics
- delete_establishment
- manage_integrations

#### ADMIN (business_admin)
- manage_users
- manage_settings
- manage_sales
- manage_inventory
- manage_customers
- manage_suppliers
- manage_offers
- manage_expenses
- view_analytics
- manage_campaigns

#### SALES (business_sales)
- create_sales
- manage_customers
- emit_invoices
- view_inventory
- view_analytics_sales

#### STOCK (business_stock)
- manage_inventory
- manage_suppliers
- create_purchase_orders
- receive_goods
- view_analytics_stock

#### MARKETING (business_marketing)
- manage_campaigns
- create_promotions
- view_analytics_marketing
- manage_customers_view
- access_analytics

## Flow

### 1. User Registration with Business Flag

```
POST /auth/register
{
  "email": "owner@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "business": true
}
```

**Result:**
- Auth Service: User created with role = 'business_owner'
- Monolith: User synced with role = 'business_owner'
- Business Service:
  - User synced with role = 'business_owner'
  - Establishment created
  - EstablishmentUser created with role = 'business_owner' and status = 'ACTIVE'

### 2. Regular User Registration

```
POST /auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Result:**
- Auth Service: User created with role = 'user'
- Monolith: User synced with role = 'user'
- Business Service: User synced with role = 'user' (no establishment created)

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
    "business": true
  }'
```

### 2. Verify in Business Database
```sql
-- Check user
SELECT * FROM somaai_business.users WHERE email = 'owner@example.com';

-- Check establishment
SELECT * FROM somaai_business.establishments WHERE ownerId = '<user-id>';

-- Check establishment_user
SELECT * FROM somaai_business.establishment_users WHERE userId = '<user-id>';
```

Expected Result:
```
users:
  id: "user-id"
  email: "owner@example.com"
  role: "business_owner"

establishments:
  id: "establishment-id"
  ownerId: "user-id"
  name: "John Doe's Business"

establishment_users:
  id: "establishment-user-id"
  establishmentId: "establishment-id"
  userId: "user-id"
  role: "business_owner"
  status: "ACTIVE"
```

## Next Steps

1. Create guards for business roles
2. Create decorators for role-based access control
3. Implement invite employee functionality
4. Implement role management endpoints
5. Add permission checking in controllers
6. Create role-based access control middleware

## Files Modified

### Monolith
- `services/monolith/src/users/entities/user.entity.ts`
- `services/monolith/src/shared/enums/user-role.enum.ts` (new)

### Auth
- `services/auth/src/auth/auth.service.ts`

### Business
- `services/business/src/shared/enums/establishment-role.enum.ts`
- `services/business/src/shared/entities/establishment-user.entity.ts` (new)
- `services/business/src/shared/kafka/business.consumer.ts`
- `services/business/src/shared/kafka/kafka.module.ts`
- `scripts/setup-business-db.js`

## Notes

- Roles are now lowercase and consistent across services
- Business service has both global roles (synced from auth) and establishment-specific roles
- EstablishmentUser table tracks user roles within each establishment
- A user can have different roles in different establishments
- OWNER role is automatically assigned when a business_owner creates an establishment
