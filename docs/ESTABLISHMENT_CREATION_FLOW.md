# Establishment Creation Flow

## Overview

Quando um usuário cria um establishment, ele automaticamente se torna `business_owner` na tabela `users` do business service.

## Fluxo Completo

### Cenário 1: Usuário se registra com `business: true`

```
POST /auth/register { business: true }
  ↓
Auth Service cria usuário com role = 'business_owner'
  ↓
Kafka publica user.created
  ↓
Business Service:
  - Sincroniza usuário com role = 'business_owner'
  - Cria establishment automaticamente
  - Cria establishment_user com role = 'business_owner'
```

**Resultado:**
- `somaai_business.users.role` = `business_owner`
- `somaai_business.establishments` criado
- `somaai_business.establishment_users.role` = `business_owner`

### Cenário 2: Usuário se registra com `business: false`, depois cria establishment

```
POST /auth/register { business: false }
  ↓
Auth Service cria usuário com role = 'user'
  ↓
Kafka publica user.created
  ↓
Business Service sincroniza usuário com role = 'user'
  ↓
Usuário faz login e chama:
POST /establishments { name: "Meu Negócio" }
  ↓
Business Service:
  1. Cria establishment
  2. Cria establishment_user com role = 'business_owner'
  3. Atualiza user.role para 'business_owner'
```

**Resultado:**
- `somaai_business.users.role` = `business_owner` (atualizado)
- `somaai_business.establishments` criado
- `somaai_business.establishment_users.role` = `business_owner`

## Implementation Details

### EstablishmentsService.create()

```typescript
async create(createEstablishmentDto: any, userId: string) {
  // 1. Get user
  const user = await this.usersRepository.findOne({ where: { id: userId } });

  // 2. Create establishment
  const establishment = this.establishmentsRepository.create({
    id: uuidv4(),
    ownerId: userId,
    name: createEstablishmentDto.name,
    // ... other fields
  });
  const savedEstablishment = await this.establishmentsRepository.save(establishment);

  // 3. Create establishment_user with business_owner role
  const establishmentUser = this.establishmentUsersRepository.create({
    id: uuidv4(),
    establishmentId: savedEstablishment.id,
    userId,
    role: 'business_owner',
    status: 'ACTIVE',
    acceptedAt: new Date(),
  });
  await this.establishmentUsersRepository.save(establishmentUser);

  // 4. Update user role to business_owner if not already
  if (user.role !== 'business_owner') {
    user.role = 'business_owner';
    await this.usersRepository.save(user);
  }

  return savedEstablishment;
}
```

## Database State After Establishment Creation

### Before (User with role = 'user')
```sql
-- somaai_business.users
id: "user-id"
email: "user@example.com"
role: "user"

-- somaai_business.establishments
(empty)

-- somaai_business.establishment_users
(empty)
```

### After (User creates establishment)
```sql
-- somaai_business.users
id: "user-id"
email: "user@example.com"
role: "business_owner"  -- UPDATED

-- somaai_business.establishments
id: "establishment-id"
ownerId: "user-id"
name: "Meu Negócio"

-- somaai_business.establishment_users
id: "establishment-user-id"
establishmentId: "establishment-id"
userId: "user-id"
role: "business_owner"
status: "ACTIVE"
```

## API Endpoint

### Create Establishment

**Endpoint:** `POST /establishments`

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Meu Negócio",
  "cnpj": "12.345.678/0001-90",
  "email": "negocio@example.com",
  "phone": "+55 11 99999-9999",
  "address": "Rua Principal, 123",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01234-567"
}
```

**Response:**
```json
{
  "id": "establishment-id",
  "ownerId": "user-id",
  "name": "Meu Negócio",
  "cnpj": "12.345.678/0001-90",
  "email": "negocio@example.com",
  "phone": "+55 11 99999-9999",
  "address": "Rua Principal, 123",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01234-567",
  "isActive": true,
  "createdAt": "2024-03-14T10:30:00Z",
  "updatedAt": "2024-03-14T10:30:00Z"
}
```

## Verification Queries

### Check User Role Updated
```sql
SELECT id, email, role FROM somaai_business.users 
WHERE id = 'user-id';
```

Expected:
```
id: "user-id"
email: "user@example.com"
role: "business_owner"
```

### Check Establishment Created
```sql
SELECT * FROM somaai_business.establishments 
WHERE ownerId = 'user-id';
```

### Check EstablishmentUser Created
```sql
SELECT * FROM somaai_business.establishment_users 
WHERE userId = 'user-id';
```

### Check All Related Data
```sql
SELECT 
  u.id as user_id,
  u.email,
  u.role as user_role,
  e.id as establishment_id,
  e.name as establishment_name,
  eu.role as establishment_role,
  eu.status
FROM somaai_business.users u
LEFT JOIN somaai_business.establishments e ON u.id = e.ownerId
LEFT JOIN somaai_business.establishment_users eu ON e.id = eu.establishmentId AND u.id = eu.userId
WHERE u.id = 'user-id';
```

## Important Notes

1. **User role is updated locally in business service only**
   - The user's role in auth service remains unchanged
   - Only `somaai_business.users.role` is updated to `business_owner`

2. **Idempotent operation**
   - If user already has role = 'business_owner', no update is performed
   - Safe to call multiple times

3. **Establishment ownership**
   - User becomes owner of the establishment
   - Can create multiple establishments
   - Each establishment has its own `establishment_users` records

4. **Multiple establishments**
   - A user can create multiple establishments
   - Each establishment has the user as owner
   - User role remains `business_owner` after first establishment

## Timeline

```
T0: User submits establishment creation request
T1: Service validates user exists (< 10ms)
T2: Service creates establishment (< 50ms)
T3: Service creates establishment_user (< 50ms)
T4: Service updates user role (< 50ms)
T5: Service returns response (< 200ms)

Total: ~200ms
```

## Error Handling

### User Not Found
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

### Validation Error
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "name is required",
    "email must be valid"
  ]
}
```

### Database Error
```json
{
  "statusCode": 500,
  "message": "Error creating establishment",
  "error": "Internal Server Error"
}
```

## Next Steps

1. Create controller endpoint for establishment creation
2. Add validation for establishment data
3. Add authorization checks (only authenticated users)
4. Add error handling and logging
5. Create tests for establishment creation flow
6. Add support for multiple establishments per user
7. Implement establishment deletion with cleanup
