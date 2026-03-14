# Fluxo de Comunicação de Autenticação

## Arquitetura

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │
       ├─────────────────────────────────────────┐
       │                                         │
       ▼                                         ▼
┌─────────────────┐                    ┌──────────────────┐
│  Auth Service   │                    │  Monolith        │
│  (3010)         │◄──────────────────►│  (3000)          │
└─────────────────┘                    └──────────────────┘
       ▲                                         ▲
       │                                         │
       └─────────────────────────────────────────┘
              (valida JWT)
```

## Fluxo Detalhado

### 1. Login (Primeira Vez)

```
Frontend
  │
  ├─ POST /api/auth/login
  │  { email, password }
  │
  ▼
Auth Service
  │
  ├─ Valida credenciais
  ├─ Gera JWT token
  │
  ▼
Frontend recebe
  {
    accessToken: "eyJhbGciOiJIUzI1NiIs...",
    refreshToken: "...",
    user: { id: "123", email: "user@example.com" }
  }
  │
  ├─ Armazena JWT em localStorage
  │
  ▼
Frontend pronto para fazer requisições
```

### 2. Requisição Autenticada (Monolith)

```
Frontend
  │
  ├─ GET /api/purchases
  │  Headers: { Authorization: "Bearer eyJhbGciOiJIUzI1NiIs..." }
  │
  ▼
Monolith recebe requisição
  │
  ├─ AuthGuard intercepta
  ├─ Extrai token do header
  │
  ▼
Monolith valida com Auth Service
  │
  ├─ POST /api/auth/verify-token
  │  Headers: { Authorization: "Bearer eyJhbGciOiJIUzI1NiIs..." }
  │
  ▼
Auth Service
  │
  ├─ Decodifica JWT
  ├─ Valida assinatura
  ├─ Verifica expiração
  │
  ▼
Auth Service retorna
  {
    valid: true,
    user: { id: "123", email: "user@example.com", isActive: true }
  }
  │
  ▼
Monolith injeta userId no request
  │
  ├─ request.user = { id: "123", ... }
  │
  ▼
Controller processa com userId validado
  │
  ├─ Retorna dados para Frontend
```

### 3. Requisição com Token Inválido

```
Frontend
  │
  ├─ GET /api/purchases
  │  Headers: { Authorization: "Bearer INVALID_TOKEN" }
  │
  ▼
Monolith recebe requisição
  │
  ├─ AuthGuard intercepta
  ├─ Extrai token
  │
  ▼
Monolith valida com Auth Service
  │
  ├─ POST /api/auth/verify-token
  │  Headers: { Authorization: "Bearer INVALID_TOKEN" }
  │
  ▼
Auth Service
  │
  ├─ Tenta decodificar
  ├─ Falha na validação
  │
  ▼
Auth Service retorna erro
  {
    statusCode: 401,
    message: "Invalid token"
  }
  │
  ▼
Monolith lança HttpException(401)
  │
  ├─ Retorna erro para Frontend
  │
  ▼
Frontend recebe 401
  │
  ├─ Limpa JWT do localStorage
  ├─ Redireciona para login
```

## Comunicação Entre Serviços

### Auth Service → Monolith

**Não há comunicação direta!**

O Auth Service não inicia comunicação com o Monolith. Apenas **responde** quando solicitado.

### Monolith → Auth Service

**Comunicação sob demanda:**

```typescript
// AuthValidationService no Monolith
async validateToken(token: string) {
  const response = await this.httpService.post(
    `${AUTH_SERVICE_URL}/api/auth/verify-token`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}
```

**Quando acontece:**
- Toda vez que uma requisição chega no Monolith
- AuthGuard valida o token
- Se inválido, retorna 401

### Frontend → Auth Service

**Comunicação direta:**

```javascript
// Login
const response = await fetch('http://localhost:3010/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});
const { accessToken } = await response.json();
localStorage.setItem('token', accessToken);

// Requisição autenticada
const purchases = await fetch('http://localhost:3000/api/purchases', {
  headers: { Authorization: `Bearer ${accessToken}` }
});
```

## Endpoints de Validação

### Auth Service

```
POST /api/auth/verify-token
  Headers: { Authorization: "Bearer <token>" }
  Response: { valid: true, user: { id, email, ... } }

GET /api/auth/me
  Headers: { Authorization: "Bearer <token>" }
  Response: { id, email, firstName, lastName, isActive }
```

### Monolith (usa Auth Service)

```
POST /api/purchases
  Headers: { Authorization: "Bearer <token>" }
  Internamente: valida com Auth Service
  Response: { id, userId, total, ... }
```

## Fluxo de Refresh Token

```
Frontend
  │
  ├─ Token expirou
  ├─ POST /api/auth/refresh
  │  { refreshToken: "..." }
  │
  ▼
Auth Service
  │
  ├─ Valida refresh token
  ├─ Gera novo access token
  │
  ▼
Frontend recebe novo token
  │
  ├─ Armazena novo token
  ├─ Retenta requisição original
```

## Segurança

### JWT Token

- **Assinado** com JWT_SECRET
- **Contém** userId, email, role
- **Não pode ser alterado** sem invalidar assinatura
- **Expira** após JWT_EXPIRATION

### Validação

- **Cada requisição** valida o token
- **Auth Service** verifica assinatura
- **Monolith** injeta userId validado
- **Sem cache** de tokens (sempre valida)

### Proteção

```
Frontend
  ├─ Armazena JWT em localStorage (ou sessionStorage)
  ├─ Envia em header Authorization
  ├─ Nunca em URL ou cookie (sem HttpOnly)

Monolith
  ├─ Valida assinatura do JWT
  ├─ Verifica expiração
  ├─ Extrai userId
  ├─ Injeta no request

Auth Service
  ├─ Mantém JWT_SECRET seguro
  ├─ Valida assinatura
  ├─ Retorna erro se inválido
```

## Exemplo Completo

### 1. Login

```bash
curl -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "f210679e-4627-4e02-806b-3138275c011f",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true
  }
}
```

### 2. Requisição Autenticada

```bash
curl -X GET http://localhost:3000/api/purchases \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Internamente no Monolith:
# 1. AuthGuard intercepta
# 2. Extrai token
# 3. Valida com Auth Service
# 4. Auth Service retorna { valid: true, user: { id: "f210679e..." } }
# 5. Injeta em request.user
# 6. Controller processa

# Response
[
  {
    "id": "purchase-1",
    "userId": "f210679e-4627-4e02-806b-3138275c011f",
    "total": 100.00,
    "status": "completed"
  }
]
```

### 3. Token Inválido

```bash
curl -X GET http://localhost:3000/api/purchases \
  -H "Authorization: Bearer INVALID_TOKEN"

# Internamente:
# 1. AuthGuard intercepta
# 2. Extrai token
# 3. Valida com Auth Service
# 4. Auth Service retorna erro
# 5. AuthGuard lança HttpException(401)

# Response
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

## Resumo

| Aspecto | Detalhes |
|--------|----------|
| **Quem valida** | Auth Service |
| **Quando valida** | A cada requisição |
| **Como valida** | Verifica assinatura do JWT |
| **Quem armazena token** | Frontend (localStorage) |
| **Quem envia token** | Frontend (header Authorization) |
| **Quem recebe token** | Monolith (AuthGuard) |
| **Comunicação** | Monolith → Auth Service (sob demanda) |
| **Sem cache** | Sempre valida com Auth Service |
| **Seguro** | JWT assinado + validação de assinatura |
