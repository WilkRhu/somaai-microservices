# Arquitetura Frontend-Backend - Fluxo de Comunicação

## 🎯 Pergunta: O Front passa tudo pelo Orquestrador?

**Resposta**: Depende do caso de uso. Vamos detalhar:

---

## 📊 Arquitetura Atual

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│                    (Web/Mobile App)                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  ORQUESTRADOR   │
                    │  (Port )    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
    ┌────────┐          ┌────────┐          ┌────────┐
    │  AUTH  │          │MONOLITH│          │PAYMENTS│
    │(3000)  │          │(3010)  │          │(3008)  │
    └────────┘          └────────┘          └────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────▼────────┐
                    │     KAFKA       │
                    │  (Event Bus)    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
    ┌────────┐          ┌────────┐          ┌────────┐
    │ SALES  │          │INVENTORY│        │DELIVERY│
    │(3001)  │          │(3002)   │        │(3003)  │
    └────────┘          └────────┘        └────────┘
```

---

## 🔄 Fluxos de Comunicação

### Opção 1: Tudo pelo Orquestrador (Recomendado)

```
Frontend
   │
   ├─ POST /api/auth/login
   │  └─ Orquestrador → Auth Service
   │     └─ Retorna JWT
   │
   ├─ GET /api/users/:id
   │  └─ Orquestrador → Monolith Service
   │     └─ Retorna dados do usuário
   │
   ├─ POST /api/orders
   │  └─ Orquestrador → Cria ordem
   │     └─ Publica evento no Kafka
   │        └─ Todos os serviços recebem
   │
   └─ GET /api/products
      └─ Orquestrador → Monolith Service
         └─ Retorna produtos
```

**Vantagens**:
- ✅ Ponto único de entrada
- ✅ Controle centralizado
- ✅ Fácil de monitorar
- ✅ Segurança centralizada
- ✅ Rate limiting em um lugar

**Desvantagens**:
- ❌ Orquestrador pode virar gargalo
- ❌ Latência adicional

---

### Opção 2: Direto para Serviços (Não Recomendado)

```
Frontend
   │
   ├─ POST http://localhost:3000/api/auth/login
   │  └─ Auth Service
   │
   ├─ GET http://localhost:3010/api/users/:id
   │  └─ Monolith Service
   │
   ├─ POST http://localhost:3008/api/payments
   │  └─ Payments Service
   │
   └─ GET http://localhost:3002/api/products
      └─ Inventory Service
```

**Vantagens**:
- ✅ Menor latência
- ✅ Menos processamento

**Desvantagens**:
- ❌ Múltiplos pontos de entrada
- ❌ Difícil de manter
- ❌ Segurança descentralizada
- ❌ Difícil de monitorar
- ❌ CORS complexo

---

### Opção 3: Híbrida (Melhor Prática)

```
Frontend
   │
   ├─ Autenticação
   │  └─ POST http://localhost:3000/api/auth/login
   │     └─ Auth Service (direto)
   │
   ├─ Tudo mais
   │  └─ Orquestrador (http://localhost:3009)
   │     ├─ GET /api/users
   │     ├─ GET /api/products
   │     ├─ POST /api/orders
   │     └─ GET /api/purchases
```

**Vantagens**:
- ✅ Auth rápido (direto)
- ✅ Resto centralizado
- ✅ Bom balanço
- ✅ Fácil de manter

**Desvantagens**:
- ⚠️ Dois pontos de entrada

---

## 🎯 Recomendação: Opção 1 (Tudo pelo Orquestrador)

### Por quê?

1. **Segurança**: Validação centralizada
2. **Controle**: Rate limiting, logging, monitoring
3. **Escalabilidade**: Fácil adicionar novos serviços
4. **Manutenção**: Um ponto de entrada
5. **Consistência**: Mesmos headers, autenticação, etc

---

## 📋 Rotas do Orquestrador

### Autenticação
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/google
POST   /api/auth/refresh
GET    /api/auth/me
POST   /api/auth/verify-token
```

### Usuários
```
POST   /api/users
GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id
PATCH  /api/users/:id
DELETE /api/users/:id
```

### Produtos
```
GET    /api/products
GET    /api/products/search
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

### Compras
```
POST   /api/purchases
GET    /api/purchases
GET    /api/purchases/:id
PUT    /api/purchases/:id
DELETE /api/purchases/:id
```

### Pagamentos
```
POST   /api/payments/pix/generate
GET    /api/payments/pix/:paymentId/status
POST   /api/payments/credit-card/process
```

---

## 🔐 Fluxo de Autenticação

```
1. Frontend: POST /api/auth/login
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ↓
2. Orquestrador: Valida credenciais
   ↓
3. Orquestrador: Chama Auth Service
   ↓
4. Auth Service: Retorna JWT
   ↓
5. Orquestrador: Retorna JWT para Frontend
   {
     "accessToken": "eyJhbGc...",
     "refreshToken": "eyJhbGc...",
     "user": { ... }
   }
   ↓
6. Frontend: Salva JWT no localStorage
   ↓
7. Frontend: Usa JWT em todas as requisições
   Authorization: Bearer eyJhbGc...
```

---

## 🚀 Fluxo de Requisição Autenticada

```
Frontend
   │
   ├─ GET /api/users/:id
   │  Headers: Authorization: Bearer <JWT>
   │
   ▼
Orquestrador
   │
   ├─ Valida JWT
   ├─ Extrai userId
   │
   ▼
Monolith Service
   │
   ├─ Busca usuário no banco
   │
   ▼
Frontend
   │
   └─ Recebe dados do usuário
```

---

## 📝 Implementação no Orquestrador

### Exemplo: Rota de Usuários

```typescript
// orchestrator/src/users/users.controller.ts

@Controller('api/users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUser(@Param('id') userId: string, @Request() req) {
    // Valida JWT
    // Chama Monolith Service
    return this.usersService.getUser(userId);
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    // Chama Auth Service para criar usuário
    return this.authService.register(createUserDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    // Valida JWT
    // Chama Monolith Service
    return this.usersService.updateUser(userId, updateUserDto);
  }
}
```

---

## 🔄 Fluxo de Ordem (com Kafka)

```
Frontend
   │
   ├─ POST /api/orders
   │  {
   │    "items": [...],
   │    "totalAmount": 100.00
   │  }
   │
   ▼
Orquestrador
   │
   ├─ Valida JWT
   ├─ Cria ordem no banco
   ├─ Publica evento "order.created" no Kafka
   │
   ▼
Kafka Topic: order.created
   │
   ├─ Sales Service recebe
   │  └─ Cria registro de venda
   │
   ├─ Inventory Service recebe
   │  └─ Atualiza estoque
   │
   ├─ Delivery Service recebe
   │  └─ Cria ordem de entrega
   │
   ├─ Payments Service recebe
   │  └─ Processa pagamento
   │
   └─ Fiscal Service recebe
      └─ Gera nota fiscal
   │
   ▼
Frontend
   │
   └─ Recebe confirmação de ordem
      {
        "orderId": "uuid",
        "status": "CREATED",
        "message": "Ordem criada com sucesso"
      }
```

---

## 🛡️ Segurança

### Headers Padrão

```
Authorization: Bearer <JWT>
Content-Type: application/json
X-Request-ID: <uuid>
X-Client-Version: 1.0.0
```

### Validações no Orquestrador

```typescript
// Middleware de autenticação
@UseGuards(JwtAuthGuard)

// Middleware de autorização
@UseGuards(RoleGuard)
@Roles('USER', 'BUSINESS_OWNER')

// Middleware de rate limiting
@UseGuards(RateLimitGuard)
@RateLimit(100) // 100 requisições por minuto
```

---

## 📊 Comparação de Arquiteturas

| Aspecto | Tudo pelo Orq. | Direto | Híbrida |
|---------|---|---|---|
| **Segurança** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Performance** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Manutenção** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Escalabilidade** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Complexidade** | ⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐ |

---

## ✅ Recomendação Final

**Use Opção 1: Tudo pelo Orquestrador**

### Configuração no Frontend

```javascript
// Frontend - Configuração de API

const API_BASE_URL = 'http://localhost:3009/api';

// Todas as requisições vão para o Orquestrador
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Uso no Frontend

```javascript
// Login
const response = await api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123',
});
localStorage.setItem('accessToken', response.data.accessToken);

// Buscar usuário
const user = await api.get('/users/123');

// Criar ordem
const order = await api.post('/orders', {
  items: [...],
  totalAmount: 100.00,
});

// Buscar produtos
const products = await api.get('/products');
```

---

## 🎯 Conclusão

✅ **Frontend passa TUDO pelo Orquestrador**
✅ **Orquestrador roteia para os serviços corretos**
✅ **Serviços se comunicam via Kafka para eventos**
✅ **Frontend nunca fala direto com serviços**

Isso garante:
- Segurança centralizada
- Controle de acesso
- Rate limiting
- Logging e monitoring
- Fácil manutenção

 