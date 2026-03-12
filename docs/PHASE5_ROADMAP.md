# Phase 5 - Testes e Deploy 🚀

## 🎯 Objetivo
Implementar testes automatizados e preparar para deploy em produção.

---

## 📅 Plano de Ação

### Semana 1: Testes Unitários
- [ ] Testes para Users Service
- [ ] Testes para Products Service
- [ ] Testes para Purchases Service
- [ ] Testes para Business Service
- [ ] Testes para Auth Service

### Semana 2: Testes de Integração
- [ ] Testes de Controllers
- [ ] Testes de Rotas
- [ ] Testes de Autenticação
- [ ] Testes de Autorização

### Semana 3: Testes E2E
- [ ] Fluxo completo de usuário
- [ ] Fluxo de compra
- [ ] Fluxo de negócio
- [ ] Testes de performance

### Semana 4: Deploy
- [ ] Docker images
- [ ] Docker Compose
- [ ] Kubernetes manifests
- [ ] CI/CD pipeline
- [ ] Deploy em staging
- [ ] Deploy em produção

---

## 🧪 Testes Unitários

### Estrutura
```
services/monolith/src/
├── users/
│   ├── users.service.spec.ts
│   └── users.controller.spec.ts
├── products/
│   ├── products.service.spec.ts
│   └── products.controller.spec.ts
└── purchases/
    ├── purchases.service.spec.ts
    └── purchases.controller.spec.ts
```

### Exemplo
```typescript
describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should create a user', async () => {
    const result = await service.createUser({
      name: 'John',
      email: 'john@example.com',
      password: 'password123',
    });

    expect(result).toBeDefined();
    expect(result.email).toBe('john@example.com');
  });
});
```

---

## 🔗 Testes de Integração

### Estrutura
```
services/monolith/test/
├── users.e2e-spec.ts
├── products.e2e-spec.ts
└── purchases.e2e-spec.ts
```

### Exemplo
```typescript
describe('Users (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('POST /users should create user', () => {
    return request(app.getHttpServer())
      .post('/api/users')
      .send({
        name: 'John',
        email: 'john@example.com',
        password: 'password123',
      })
      .expect(201);
  });
});
```

---

## 🐳 Docker

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3010

CMD ["npm", "run", "start:prod"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  monolith:
    build: ./services/monolith
    ports:
      - "3010:3010"
    environment:
      - DB_HOST=mysql
      - DB_DATABASE=somaai_monolith
    depends_on:
      - mysql

  mysql:
    image: mysql:8
    environment:
      - MYSQL_ROOT_PASSWORD=root
      - MYSQL_DATABASE=somaai_monolith
    ports:
      - "3306:3306"
```

---

## ☸️ Kubernetes

### Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: monolith
spec:
  replicas: 3
  selector:
    matchLabels:
      app: monolith
  template:
    metadata:
      labels:
        app: monolith
    spec:
      containers:
      - name: monolith
        image: somaai/monolith:latest
        ports:
        - containerPort: 3010
        env:
        - name: DB_HOST
          value: mysql
        - name: DB_DATABASE
          value: somaai_monolith
```

### Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: monolith
spec:
  selector:
    app: monolith
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3010
  type: LoadBalancer
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: docker/setup-buildx-action@v1
      - uses: docker/build-push-action@v2
        with:
          context: ./services/monolith
          push: true
          tags: somaai/monolith:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: kubectl apply -f k8s/
```

---

## 📋 Checklist

### Testes Unitários
- [ ] Users Service tests
- [ ] Products Service tests
- [ ] Purchases Service tests
- [ ] Business Service tests
- [ ] Auth Service tests
- [ ] Coverage > 80%

### Testes de Integração
- [ ] Users Controller tests
- [ ] Products Controller tests
- [ ] Purchases Controller tests
- [ ] Business Controller tests
- [ ] Auth Controller tests

### Testes E2E
- [ ] User registration flow
- [ ] Login flow
- [ ] Purchase flow
- [ ] Business operations flow
- [ ] Performance tests

### Docker
- [ ] Dockerfile para cada serviço
- [ ] Docker Compose local
- [ ] Docker images no registry

### Kubernetes
- [ ] Deployments
- [ ] Services
- [ ] ConfigMaps
- [ ] Secrets
- [ ] Ingress

### CI/CD
- [ ] GitHub Actions workflow
- [ ] Testes automáticos
- [ ] Build automático
- [ ] Deploy automático

---

## 🚀 Próximos Passos

1. **Hoje**: Criar testes unitários
2. **Amanhã**: Criar testes de integração
3. **Próxima semana**: Testes E2E
4. **Semana seguinte**: Docker e Kubernetes
5. **Semana seguinte**: CI/CD e Deploy

---

## 📊 Métricas de Sucesso

- ✅ Coverage > 80%
- ✅ Todos os testes passando
- ✅ Deploy automático funcionando
- ✅ Zero downtime deployment
- ✅ Performance < 200ms por requisição

---

## 🎯 Qual quer começar?

1. **Testes Unitários** - Começar com Users Service
2. **Testes de Integração** - Testar rotas completas
3. **Docker** - Containerizar serviços
4. **Kubernetes** - Orquestração
5. **CI/CD** - Automação

Qual você prefere? 🚀

