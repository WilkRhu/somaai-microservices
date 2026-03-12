# 🚀 Comece Aqui - Guia Rápido

## 📋 O que foi criado?

Você tem agora a **Prioridade 0 completa** da arquitetura de microserviços SomaAI:

1. **API Gateway** (Nginx) - Porta 80
2. **Auth Service** (NestJS) - Porta 3000
3. **Monolith Core** (NestJS) - Porta 3000

---

## 🏃 Quick Start (5 minutos)

### 1. Auth Service

```bash
cd services/auth

# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run start:dev
```

Acesse: `http://localhost:3000`

### 2. Monolith Service

```bash
cd services/monolith

# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run start:dev
```

Acesse: `http://localhost:3000`

### 3. Gateway

```bash
# Build
docker build -t somaai-gateway services/gateway

# Run
docker run -p 80:80 somaai-gateway
```

Acesse: `http://localhost`

---

## 🧪 Testar Endpoints

### 1. Registrar Usuário

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### 2. Fazer Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Você receberá um `accessToken` e `refreshToken`.

### 3. Usar Token para Acessar Endpoints Protegidos

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Criar Estabelecimento

```bash
curl -X POST http://localhost:3000/api/establishments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Minha Loja",
    "cnpj": "12.345.678/0001-90",
    "email": "loja@example.com",
    "phone": "(11) 99999-9999",
    "address": "Rua Principal, 123",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567"
  }'
```

### 5. Criar Subscription

```bash
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "establishmentId": "ESTABLISHMENT_ID",
    "planName": "Premium",
    "price": 99.90,
    "billingCycle": "monthly",
    "autoRenew": true
  }'
```

---

## 📁 Estrutura de Pastas

```
services/
├── gateway/          # Nginx reverse proxy
├── auth/             # Serviço de autenticação
└── monolith/         # Serviço core

docs/
├── TAREFAS.md        # Lista de tarefas atualizada
├── PROGRESSO.md      # Progresso do projeto
├── RESUMO_EXECUCAO.md # Resumo do que foi feito
└── COMECE_AQUI.md    # Este arquivo
```

---

## 🔑 Variáveis de Ambiente

### Auth Service (.env)

```
NODE_ENV=development
APP_PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=somaai
DB_PASSWORD=somaai_password
DB_DATABASE=somaai_auth
JWT_SECRET=your-secret-key
JWT_EXPIRATION=3600
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRATION=604800
BCRYPT_ROUNDS=10
```

### Monolith Service (.env)

```
NODE_ENV=development
APP_PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=somaai
DB_PASSWORD=somaai_password
DB_DATABASE=somaai_monolith
AUTH_SERVICE_URL=http://localhost:3000
JWT_SECRET=your-secret-key
JWT_EXPIRATION=3600
```

---

## 🗄️ Banco de Dados

Ambos os serviços usam MySQL. Você precisa ter MySQL rodando:

```bash
# Com Docker
docker run -d \
  --name mysql-somaai \
  -e MYSQL_ROOT_PASSWORD=root_password \
  -e MYSQL_USER=somaai \
  -e MYSQL_PASSWORD=somaai_password \
  -e MYSQL_DATABASE=somaai_auth \
  -p 3306:3306 \
  mysql:8.0
```

---

## 📊 Endpoints Disponíveis

### Auth Service
- `POST /api/auth/register` - Registrar
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/me` - Usuário atual
- `POST /api/auth/verify-token` - Verificar token

### Monolith Service
- `GET /api/users/:id` - Obter usuário
- `PATCH /api/users/:id` - Atualizar usuário
- `GET /api/users/profile/me` - Perfil
- `POST /api/establishments` - Criar
- `GET /api/establishments/:id` - Obter
- `GET /api/establishments` - Listar
- `PATCH /api/establishments/:id` - Atualizar
- `POST /api/subscriptions` - Criar
- `GET /api/subscriptions/:id` - Obter
- `GET /api/subscriptions` - Listar
- `PATCH /api/subscriptions/:id` - Atualizar
- `DELETE /api/subscriptions/:id` - Cancelar

---

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes com cobertura
npm run test:cov

# Testes E2E
npm run test:e2e
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module"
```bash
npm install
```

### Erro: "Port already in use"
```bash
# Mude a porta em .env
APP_PORT=3001
```

### Erro: "Connection refused" (MySQL)
```bash
# Verifique se MySQL está rodando
docker ps | grep mysql
```

### Erro: "Invalid token"
```bash
# Certifique-se de usar o token correto
# Tokens expiram em 1 hora (3600 segundos)
# Use o refreshToken para obter um novo accessToken
```

---

## 📚 Documentação Completa

- [TAREFAS.md](./TAREFAS.md) - Lista de tarefas com progresso
- [PROGRESSO.md](./PROGRESSO.md) - Progresso detalhado
- [RESUMO_EXECUCAO.md](./RESUMO_EXECUCAO.md) - Resumo do que foi feito
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura geral
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Guia de implementação

---

## 🎯 Próximos Passos

1. ✅ Prioridade 0 concluída
2. ⏳ Fase 1: OCR, Fiscal, Payments Services
3. ⏳ Fase 2: Sales, Inventory, Delivery, Suppliers, Offers
4. ⏳ Fase 3: Notifications, Analytics

---

## 💡 Dicas

- Use Postman ou Insomnia para testar endpoints
- Verifique os logs com `npm run start:dev`
- Leia os arquivos .env.example para entender as variáveis
- Todos os serviços têm health check em `/health`

---

## 🆘 Precisa de Ajuda?

1. Verifique [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Leia os READMEs em cada serviço
3. Verifique os logs do Docker
4. Consulte a documentação do NestJS

---

**Boa sorte! 🚀**

Você tem uma base sólida para construir os próximos serviços.
