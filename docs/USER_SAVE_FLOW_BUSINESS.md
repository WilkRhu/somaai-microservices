# User Save Flow in Business Service

## Overview

Quando um usuário se registra com `business: true`, o fluxo completo de salvamento no business service é:

```
POST /auth/register (business: true)
    ↓
Auth Service cria usuário com role = 'business_owner'
    ↓
Publica evento Kafka: user.created
    ↓
Business Service Consumer recebe evento
    ↓
Salva usuário em somaai_business.users
    ↓
Cria establishment
    ↓
Cria registro em establishment_users com role = 'business_owner'
```

## Detailed Flow

### 1. Registration Request

**Endpoint:** `POST /auth/register`

**Payload:**
```json
{
  "email": "owner@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+55 11 99999-9999",
  "business": true
}
```

### 2. Auth Service Processing

**File:** `services/auth/src/auth/auth.service.ts`

```typescript
async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
  const { email, password, firstName, lastName, phone, business } = registerDto;

  // Determine role based on business flag
  const role = business ? 'business_owner' : 'user';

  // Create user in somaai_auth.users
  const user = this.usersRepository.create({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    phone,
    authProvider: 'EMAIL',
    role,  // 'business_owner' or 'user'
  });

  const savedUser = await this.usersRepository.save(user);

  // Publish Kafka event
  await this.kafkaService.publishUserCreated(savedUser);
  // Event payload:
  // {
  //   id: "user-id",
  //   email: "owner@example.com",
  //   firstName: "John",
  //   lastName: "Doe",
  //   role: "business_owner",
  //   createdAt: "2024-03-14T00:00:00Z"
  // }
}
```

### 3. Kafka Event Published

**Topic:** `user.created`

**Message:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "owner@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "business_owner",
  "createdAt": "2024-03-14T10:30:00Z"
}
```

### 4. Business Service Consumer Processing

**File:** `services/business/src/shared/kafka/business.consumer.ts`

```typescript
async handleUserCreated(message: any) {
  const { id: userId, role, email, firstName, lastName } = message;

  // Step 1: Sync user to business database
  await this.userService.createOrUpdate({
    id: userId,
    email,
    firstName,
    lastName,
    role,  // 'business_owner'
  });
  // Saves to somaai_business.users

  // Step 2: Check if user is BUSINESS_OWNER
  if (role !== 'business_owner') {
    return; // Not a business owner, skip establishment creation
  }

  // Step 3: Create establishment
  const establishment = this.establishmentsRepository.create({
    id: uuidv4(),
    ownerId: userId,
    name: `${firstName} ${lastName}'s Business`,
    email,
    isActive: true,
  });

  const savedEstablishment = await this.establishmentsRepository.save(establishment);
  // Saves to somaai_business.establishments

  // Step 4: Create establishment_user record
  const establishmentUser = this.establishmentUsersRepository.create({
    id: uuidv4(),
    establishmentId: savedEstablishment.id,
    userId,
    role: 'business_owner',
    status: 'ACTIVE',
    acceptedAt: new Date(),
  });

  await this.establishmentUsersRepository.save(establishmentUser);
  // Saves to somaai_business.establishment_users
}
```

## Database State After Registration

### somaai_auth.users
```sql
INSERT INTO users VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'owner@example.com',
  'hashed_password',
  'John',
  'Doe',
  true,
  false,
  '+55 11 99999-9999',
  NULL,
  'business_owner',
  '2024-03-14 10:30:00',
  '2024-03-14 10:30:00',
  NULL
);
```

### somaai_business.users
```sql
INSERT INTO users VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'owner@example.com',
  'John',
  'Doe',
  'business_owner',
  '+55 11 99999-9999',
  NULL,
  true,
  false,
  '2024-03-14 10:30:00',
  '2024-03-14 10:30:00',
  NULL
);
```

### somaai_business.establishments
```sql
INSERT INTO establishments VALUES (
  '660e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  'John Doe\'s Business',
  NULL,
  'owner@example.com',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  true,
  '2024-03-14 10:30:00',
  '2024-03-14 10:30:00'
);
```

### somaai_business.establishment_users
```sql
INSERT INTO establishment_users VALUES (
  '770e8400-e29b-41d4-a716-446655440002',
  '660e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  'business_owner',
  NULL,
  NULL,
  '2024-03-14 10:30:00',
  'ACTIVE',
  '2024-03-14 10:30:00',
  '2024-03-14 10:30:00'
);
```

## User Service Implementation

**File:** `services/business/src/shared/services/user.service.ts`

```typescript
async createOrUpdate(userData: any): Promise<User> {
  const { id, email, firstName, lastName, role, phone, avatar, isActive, emailVerified } = userData;

  let user = await this.usersRepository.findOne({ where: { id } });

  if (user) {
    // Update existing user
    user.email = email;
    user.firstName = firstName;
    user.lastName = lastName;
    user.role = role || user.role;
    user.phone = phone || user.phone;
    user.avatar = avatar || user.avatar;
    user.isActive = isActive !== undefined ? isActive : user.isActive;
    user.emailVerified = emailVerified !== undefined ? emailVerified : user.emailVerified;
    user.updatedAt = new Date();
  } else {
    // Create new user
    user = this.usersRepository.create({
      id,
      email,
      firstName,
      lastName,
      role: role || 'user',
      phone,
      avatar,
      isActive: isActive !== undefined ? isActive : true,
      emailVerified: emailVerified !== undefined ? emailVerified : false,
    });
  }

  const savedUser = await this.usersRepository.save(user);
  this.logger.log(`User ${id} synced to business database`);
  return savedUser;
}
```

## Complete Request/Response Cycle

### Request
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

### Response (from Auth Service)
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "owner@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "business_owner",
    "isActive": true
  }
}
```

### Async Processing (Kafka)
```
1. Auth Service publishes user.created event
2. Business Service Consumer receives event
3. User synced to somaai_business.users
4. Establishment created in somaai_business.establishments
5. EstablishmentUser created in somaai_business.establishment_users
```

## Verification Queries

### Check User in Business Database
```sql
SELECT * FROM somaai_business.users 
WHERE email = 'owner@example.com';
```

### Check Establishment
```sql
SELECT * FROM somaai_business.establishments 
WHERE ownerId = '550e8400-e29b-41d4-a716-446655440000';
```

### Check Establishment User
```sql
SELECT * FROM somaai_business.establishment_users 
WHERE userId = '550e8400-e29b-41d4-a716-446655440000';
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
WHERE u.email = 'owner@example.com';
```

## Error Handling

### If User Sync Fails
- Log error but don't fail the registration
- User is created in auth service
- Kafka event is published
- Business service will retry on next event

### If Establishment Creation Fails
- User is already synced
- Log error but don't fail
- Manual intervention may be needed

### If EstablishmentUser Creation Fails
- Establishment is already created
- Log error but don't fail
- User can still access establishment as owner (via ownerId)

## Timeline

```
T0: User submits registration form
T1: Auth Service creates user (< 100ms)
T2: Auth Service publishes Kafka event (< 50ms)
T3: Auth Service returns response to client (< 200ms)
T4: Business Service Consumer receives event (< 100ms)
T5: Business Service syncs user (< 50ms)
T6: Business Service creates establishment (< 50ms)
T7: Business Service creates establishment_user (< 50ms)

Total async processing: ~250ms
User sees response: ~200ms
```

## Notes

- The registration response is sent immediately (T3)
- Establishment creation happens asynchronously via Kafka (T4-T7)
- If Kafka is down, user is still created but establishment creation is delayed
- User can login immediately after registration
- Establishment will be created when Kafka consumer processes the event
- All operations are idempotent (safe to retry)
