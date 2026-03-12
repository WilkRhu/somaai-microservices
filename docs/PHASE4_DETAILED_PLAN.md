# Phase 4 - Plano Detalhado de Implementação

## 📊 Status Atual do Monolith

### ✅ Já Implementado
- Users Module (3 rotas)
  - GET /users/:id
  - PATCH /users/:id
  - GET /users/profile/me
- Entities (User, UserAddress, UserCard, UserProfile)
- DTOs (UpdateUserDto, UserResponseDto)

### ❌ Faltando
- Users Module (10 rotas adicionais)
- Products Module (6 rotas)
- Purchases Module (6 rotas)

---

## 🎯 FASE 1: Expandir Users Module (Dia 1-2)

### Rotas a Adicionar (10)
```
POST   /users                    // Criar usuário
GET    /users                    // Listar usuários (ADMIN)
PUT    /users/:id                // Atualizar usuário (PUT)
DELETE /users/:id                // Deletar usuário
POST   /users/:id/avatar         // Upload avatar
GET    /users/:id/onboarding/status
POST   /users/:id/onboarding/complete
GET    /users/admin/stats        // Stats (ADMIN)
GET    /admin/users              // Listar (ADMIN)
PUT    /admin/users/:id/role     // Alterar role (ADMIN)
```

### Tarefas
1. Criar DTOs adicionais
   - CreateUserDto
   - AdminUpdateUserDto
   - OnboardingDto
   - UserStatsDto

2. Expandir UsersController
   - Adicionar 10 rotas

3. Expandir UsersService
   - Implementar lógica para cada rota

4. Testar

---

## 🎯 FASE 2: Criar Products Module (Dia 2-3)

### Rotas (6)
```
GET    /products                 // Listar
GET    /products/search          // Buscar
GET    /products/autocomplete    // Autocomplete
GET    /products/brand           // Por marca
GET    /products/category        // Por categoria
GET    /products/top             // Top produtos
```

### Estrutura
```
services/monolith/src/products/
├── dto/
│   ├── product-response.dto.ts
│   ├── product-search.dto.ts
│   └── product-filter.dto.ts
├── entities/
│   └── product.entity.ts (já existe)
├── products.controller.ts
├── products.module.ts
└── products.service.ts
```

### Tarefas
1. Criar DTOs
2. Criar ProductsController
3. Criar ProductsService
4. Testar

---

## 🎯 FASE 3: Criar Purchases Module (Dia 3-4)

### Rotas (6)
```
POST   /users/:userId/purchases
GET    /users/:userId/purchases
GET    /users/:userId/purchases/summary
GET    /users/:userId/purchases/:purchaseId
PUT    /users/:userId/purchases/:purchaseId
DELETE /users/:userId/purchases/:purchaseId
```

### Estrutura
```
services/monolith/src/purchases/
├── dto/
│   ├── create-purchase.dto.ts
│   ├── update-purchase.dto.ts
│   ├── purchase-response.dto.ts
│   └── purchase-summary.dto.ts
├── entities/
│   ├── purchase.entity.ts (já existe)
│   ├── purchase-item.entity.ts (já existe)
│   └── purchase-installment.entity.ts (já existe)
├── purchases.controller.ts
├── purchases.module.ts
└── purchases.service.ts
```

### Tarefas
1. Criar DTOs
2. Criar PurchasesController
3. Criar PurchasesService
4. Testar

---

## 🎯 FASE 4: Adicionar Autenticação JWT (Dia 4-5)

### Estrutura
```
services/auth/src/
├── guards/
│   ├── jwt.guard.ts
│   └── roles.guard.ts
├── decorators/
│   ├── auth.decorator.ts
│   └── roles.decorator.ts
└── strategies/
    └── jwt.strategy.ts
```

### Tarefas
1. Criar JWT Strategy
2. Criar JWT Guard
3. Criar Roles Guard
4. Criar Decorators
5. Adicionar guards aos controllers
6. Testar

---

## 🎯 FASE 5: Integração Orchestrator (Dia 5)

### Estrutura
```
services/orchestrator/src/
├── business/
│   ├── business.controller.ts
│   ├── business.module.ts
│   └── business.service.ts
```

### Tarefas
1. Criar módulo Business Proxy
2. Implementar rotas proxy
3. Testar integração

---

## 📋 Ordem de Implementação

### Dia 1-2: FASE 1 (Users)
- [ ] Criar DTOs
- [ ] Expandir controller
- [ ] Expandir service
- [ ] Testar

### Dia 2-3: FASE 2 (Products)
- [ ] Criar DTOs
- [ ] Criar controller
- [ ] Criar service
- [ ] Testar

### Dia 3-4: FASE 3 (Purchases)
- [ ] Criar DTOs
- [ ] Criar controller
- [ ] Criar service
- [ ] Testar

### Dia 4-5: FASE 4 (JWT)
- [ ] Criar guards
- [ ] Criar decorators
- [ ] Adicionar aos controllers
- [ ] Testar

### Dia 5: FASE 5 (Orchestrator)
- [ ] Criar módulo proxy
- [ ] Implementar rotas
- [ ] Testar

---

## 🚀 Começando Agora!

Vamos começar pela **FASE 1: Expandir Users Module**

