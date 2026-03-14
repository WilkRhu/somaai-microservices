# Resumo de Mudanças de Rotas - Autenticação Centralizada

## Rotas que Mudaram no Monolith

### 1. Purchases (Compras)

**Antes:**
```
POST   /api/users/:userId/purchases
GET    /api/users/:userId/purchases
GET    /api/users/:userId/purchases/summary
GET    /api/users/:userId/purchases/:purchaseId
PUT    /api/users/:userId/purchases/:purchaseId
DELETE /api/users/:userId/purchases/:purchaseId
```

**Depois:**
```
POST   /api/purchases
GET    /api/purchases
GET    /api/purchases/summary
GET    /api/purchases/:purchaseId
PUT    /api/purchases/:purchaseId
DELETE /api/purchases/:purchaseId
```

**Mudança:** userId removido do path, agora vem do JWT token

---

### 2. Subscriptions (Assinaturas)

**Antes:**
```
POST   /api/subscriptions (sem @UseGuards)
GET    /api/subscriptions (sem @UseGuards)
GET    /api/subscriptions/:id (sem @UseGuards)
PATCH  /api/subscriptions/:id (sem @UseGuards)
DELETE /api/subscriptions/:id (sem @UseGuards)
```

**Depois:**
```
POST   /api/subscriptions (@UseGuards(AuthGuard))
GET    /api/subscriptions (@UseGuards(AuthGuard))
GET    /api/subscriptions/:id (@UseGuards(AuthGuard))
PATCH  /api/subscriptions/:id (@UseGuards(AuthGuard))
DELETE /api/subscriptions/:id (@UseGuards(AuthGuard))
```

**Mudança:** Adicionado AuthGuard para validar JWT

---

### 3. Establishments (Estabelecimentos)

**Antes:**
```
POST   /api/establishments (sem @UseGuards)
GET    /api/establishments (sem @UseGuards)
GET    /api/establishments/:id (sem @UseGuards)
PATCH  /api/establishments/:id (sem @UseGuards)
```

**Depois:**
```
POST   /api/establishments (@UseGuards(AuthGuard))
GET    /api/establishments (@UseGuards(AuthGuard))
GET    /api/establishments/:id (@UseGuards(AuthGuard))
PATCH  /api/establishments/:id (@UseGuards(AuthGuard))
```

**Mudança:** Adicionado AuthGuard para validar JWT

---

### 4. Users (Usuários)

**Antes:**
```
GET    /api/users/:id (sem @UseGuards)
PUT    /api/users/:id (sem @UseGuards)
PATCH  /api/users/:id (sem @UseGuards)
DELETE /api/users/:id (sem @UseGuards)
POST   /api/users/:id/avatar (sem @UseGuards)
GET    /api/users/:id/onboarding/status (sem @UseGuards)
GET    /api/users/:id/purchases (sem @UseGuards)
POST   /api/users/:id/onboarding/complete (sem @UseGuards)
GET    /api/users/profile/me (@ApiBearerAuth mas sem @UseGuards)
```

**Depois:**
```
GET    /api/users/:id (@UseGuards(AuthGuard) + validação de acesso)
PUT    /api/users/:id (@UseGuards(AuthGuard) + validação de acesso)
PATCH  /api/users/:id (@UseGuards(AuthGuard) + validação de acesso)
DELETE /api/users/:id (@UseGuards(AuthGuard) + validação de acesso)
POST   /api/users/:id/avatar (@UseGuards(AuthGuard) + validação de acesso)
GET    /api/users/:id/onboarding/status (@UseGuards(AuthGuard) + validação de acesso)
GET    /api/users/:id/purchases (@UseGuards(AuthGuard) + validação de acesso)
POST   /api/users/:id/onboarding/complete (@UseGuards(AuthGuard) + validação de acesso)
GET    /api/users/profile/me (@UseGuards(AuthGuard))
```

**Mudança:** Adicionado AuthGuard + validação que usuário só acessa seus próprios dados

---

### 5. Admin Users (Usuários Admin)

**Antes:**
```
GET    /api/admin/users (sem @UseGuards)
GET    /api/admin/users/:id (sem @UseGuards)
PUT    /api/admin/users/:id (sem @UseGuards)
DELETE /api/admin/users/:id (sem @UseGuards)
PUT    /api/admin/users/:id/role (sem @UseGuards)
```

**Depois:**
```
GET    /api/admin/users (@UseGuards(AuthGuard, RoleGuard) + @Roles('ADMIN'))
GET    /api/admin/users/:id (@UseGuards(AuthGuard, RoleGuard) + @Roles('ADMIN'))
PUT    /api/admin/users/:id (@UseGuards(AuthGuard, RoleGuard) + @Roles('ADMIN'))
DELETE /api/admin/users/:id (@UseGuards(AuthGuard, RoleGuard) + @Roles('ADMIN'))
PUT    /api/admin/users/:id/role (@UseGuards(AuthGuard, RoleGuard) + @Roles('ADMIN'))
```

**Mudança:** Adicionado AuthGuard + RoleGuard para validar role ADMIN

---

## Rotas que NÃO Mudaram

### Products (Produtos)
```
GET /api/products (público)
GET /api/products/search (público)
GET /api/products/autocomplete (público)
GET /api/products/brand (público)
GET /api/products/category (público)
GET /api/products/top (público)
```

### Users Internal (Interno)
```
POST /api/users/internal/sync-from-auth (protegido por header X-Internal-Service)
GET /api/users/internal/check/:userId (protegido por header X-Internal-Service)
```

---

## Mudanças no Orchestrator

### Business Service Routes

**Antes:**
```
POST   /api/business/sales
GET    /api/business/sales
GET    /api/business/sales/:id
PUT    /api/business/sales/:id
DELETE /api/business/sales/:id
```

**Depois:**
```
POST   /api/business/sales (chama /api/purchases no monolith)
GET    /api/business/sales (chama /api/purchases no monolith)
GET    /api/business/sales/:id (chama /api/purchases/:id no monolith)
PUT    /api/business/sales/:id (chama /api/purchases/:id no monolith)
DELETE /api/business/sales/:id (chama /api/purchases/:id no monolith)
```

**Mudança:** Orchestrator agora passa o JWT token para o monolith

---

## Como Atualizar o Frontend

### Antes
```javascript
// Compras
POST /api/users/123/purchases
GET /api/users/123/purchases
GET /api/users/123/purchases/456

// Assinaturas
POST /api/subscriptions (sem token)
GET /api/subscriptions (sem token)

// Estabelecimentos
POST /api/establishments (sem token)
GET /api/establishments (sem token)
```

### Depois
```javascript
// Compras
POST /api/purchases (com JWT token)
GET /api/purchases (com JWT token)
GET /api/purchases/456 (com JWT token)

// Assinaturas
POST /api/subscriptions (com JWT token)
GET /api/subscriptions (com JWT token)

// Estabelecimentos
POST /api/establishments (com JWT token)
GET /api/establishments (com JWT token)

// Todos os requests precisam ter:
Authorization: Bearer <JWT_TOKEN>
```

---

## Resumo das Mudanças

| Aspecto | Antes | Depois |
|--------|-------|--------|
| **Autenticação** | Sem validação | JWT obrigatório |
| **userId** | Parâmetro na rota | Extraído do JWT |
| **Purchases** | `/api/users/:userId/purchases` | `/api/purchases` |
| **Subscriptions** | Sem guard | Com AuthGuard |
| **Establishments** | Sem guard | Com AuthGuard |
| **Users** | Sem validação de acesso | Valida acesso próprio |
| **Admin** | Sem validação de role | Valida role ADMIN |
| **Orchestrator** | Sem token | Passa JWT token |

---

## Checklist de Atualização

- [ ] Atualizar frontend para enviar JWT em todas as requisições
- [ ] Remover userId dos parâmetros de rota (purchases)
- [ ] Adicionar Authorization header em todas as requisições autenticadas
- [ ] Testar fluxo completo de autenticação
- [ ] Testar validação de acesso (usuário só acessa seus dados)
- [ ] Testar rotas admin com role validation
- [ ] Atualizar documentação da API
- [ ] Atualizar testes automatizados
