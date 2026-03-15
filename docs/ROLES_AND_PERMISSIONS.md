# Roles and Permissions Architecture

## Overview

O sistema tem dois contextos de roles diferentes:

1. **Auth Service Roles** - Roles globais do usuário no sistema
2. **Business Service Roles** - Roles específicos dentro de um establishment

## Auth Service Roles (Global)

Definidos em `services/auth/src/auth/entities/user.entity.ts`:

```
- USER: Usuário comum (cliente)
- BUSINESS_OWNER: Proprietário de negócio (pode criar establishments)
- ADMIN: Administrador do sistema
```

## Business Service Roles (Establishment-specific)

Definidos em `services/business/src/shared/enums/establishment-role.enum.ts`:

```
- OWNER: Proprietário do establishment (criador)
- MANAGER: Gerente (pode gerenciar operações)
- EMPLOYEE: Funcionário (acesso limitado)
- VIEWER: Visualizador (apenas leitura)
```

## Role Mapping

### Quando um BUSINESS_OWNER se registra:

```
Auth Service:
  role = 'BUSINESS_OWNER'

Business Service:
  users.role = 'BUSINESS_OWNER' (cópia do auth)
  
  establishment_users (nova tabela):
    role = 'OWNER' (role específico do establishment)
    establishmentId = <id do establishment criado>
    userId = <id do usuário>
```

### Quando um USER regular se registra:

```
Auth Service:
  role = 'USER'

Business Service:
  users.role = 'USER' (cópia do auth)
  
  establishment_users:
    (nenhum registro - não tem acesso a nenhum establishment)
```

### Quando um OWNER convida um EMPLOYEE:

```
Auth Service:
  role = 'USER' (usuário comum)

Business Service:
  users.role = 'USER'
  
  establishment_users:
    role = 'EMPLOYEE' (role específico do establishment)
    establishmentId = <id do establishment>
    userId = <id do usuário convidado>
```

## Database Schema

### Users Table (sincronizado do auth)
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  firstName VARCHAR(255) NOT NULL,
  lastName VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'USER',  -- GLOBAL ROLE (USER, BUSINESS_OWNER, ADMIN)
  phone VARCHAR(20),
  avatar VARCHAR(255),
  isActive BOOLEAN DEFAULT true,
  emailVerified BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastLogin TIMESTAMP NULL
);
```

### Establishment Users Table (novo)
```sql
CREATE TABLE establishment_users (
  id VARCHAR(36) PRIMARY KEY,
  establishmentId VARCHAR(36) NOT NULL,
  userId VARCHAR(36) NOT NULL,
  role VARCHAR(50) NOT NULL,  -- ESTABLISHMENT ROLE (OWNER, MANAGER, EMPLOYEE, VIEWER)
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

## Permission Matrix

### OWNER (Proprietário)
- ✅ Gerenciar establishment (editar, deletar)
- ✅ Gerenciar employees (convidar, remover, alterar role)
- ✅ Acessar todas as operações (vendas, inventário, etc)
- ✅ Acessar relatórios e analytics
- ✅ Gerenciar configurações

### MANAGER (Gerente)
- ✅ Gerenciar operações (vendas, inventário)
- ✅ Gerenciar employees (convidar, remover)
- ❌ Editar configurações do establishment
- ❌ Deletar establishment
- ✅ Acessar relatórios

### EMPLOYEE (Funcionário)
- ✅ Criar vendas
- ✅ Gerenciar inventário
- ✅ Visualizar relatórios básicos
- ❌ Gerenciar employees
- ❌ Acessar configurações

### VIEWER (Visualizador)
- ✅ Visualizar dados (apenas leitura)
- ❌ Criar ou editar dados
- ❌ Gerenciar employees
- ❌ Acessar configurações

## Implementation Plan

### Phase 1: Create Establishment Roles Enum
- [ ] Create `services/business/src/shared/enums/establishment-role.enum.ts`
- [ ] Define OWNER, MANAGER, EMPLOYEE, VIEWER

### Phase 2: Create Establishment Users Table
- [ ] Create `services/business/src/shared/entities/establishment-user.entity.ts`
- [ ] Update database setup script

### Phase 3: Update Business Consumer
- [ ] When BUSINESS_OWNER registers, create establishment_users record with OWNER role
- [ ] When USER registers, don't create establishment_users record

### Phase 4: Create Establishment Users Service
- [ ] Implement invite employee functionality
- [ ] Implement role management
- [ ] Implement permission checking

### Phase 5: Create Guards and Decorators
- [ ] Create `@EstablishmentRole()` decorator
- [ ] Create `EstablishmentRoleGuard`
- [ ] Implement permission checking in controllers

## Example Usage

### Register as Business Owner
```bash
POST /auth/register
{
  "email": "owner@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "business": true
}
```

Result:
- Auth Service: User created with role = 'BUSINESS_OWNER'
- Business Service: 
  - User synced with role = 'BUSINESS_OWNER'
  - Establishment created
  - EstablishmentUser created with role = 'OWNER'

### Invite Employee
```bash
POST /establishments/:id/invite
{
  "email": "employee@example.com",
  "role": "EMPLOYEE"
}
```

Result:
- User invited to establishment with role = 'EMPLOYEE'
- EstablishmentUser created with status = 'PENDING'
- Email sent to employee with invitation link

### Check Permission
```typescript
@Get('/establishments/:id/sales')
@UseGuards(EstablishmentRoleGuard)
@EstablishmentRole('OWNER', 'MANAGER', 'EMPLOYEE')
async getSales(@Param('id') establishmentId: string) {
  // Only OWNER, MANAGER, or EMPLOYEE can access
}
```

## Notes

- Global roles (USER, BUSINESS_OWNER, ADMIN) são sincronizados do auth service
- Establishment roles são gerenciados localmente no business service
- Um usuário pode ter múltiplos establishment roles (em diferentes establishments)
- Um BUSINESS_OWNER pode ter role = OWNER em um establishment e EMPLOYEE em outro
