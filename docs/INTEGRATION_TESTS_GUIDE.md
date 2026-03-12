# Guia de Testes de Integração

**Status**: Framework Ready (4/8 serviços iniciados)  
**Tempo Estimado**: 10-12 horas para completar  
**Dificuldade**: Média

---

## 📋 O Que São Testes de Integração?

Testes de integração validam que múltiplos componentes funcionam juntos corretamente:

- ✅ Endpoints HTTP funcionam
- ✅ Autenticação JWT funciona
- ✅ Validação de entrada funciona
- ✅ Banco de dados funciona
- ✅ Kafka producer/consumer funciona
- ✅ Fluxos completos funcionam

---

## 🚀 Como Rodar Testes de Integração

### Rodar todos os testes de integração
```bash
npm run test:integration
```

### Rodar testes de um serviço específico
```bash
npm run test:integration -- sales
npm run test:integration -- inventory
npm run test:integration -- delivery
```

### Rodar com cobertura
```bash
npm run test:integration:cov
```

---

## 📁 Estrutura de Testes de Integração

```
services/
├── sales/
│   ├── src/
│   │   ├── sales/
│   │   │   ├── sales.controller.ts
│   │   │   ├── sales.service.ts
│   │   │   └── sales.module.ts
│   │   └── ...
│   └── test/
│       └── integration/
│           └── sales.integration.spec.ts  ✅ CRIADO
│
├── inventory/
│   ├── src/
│   └── test/
│       └── integration/
│           └── inventory.integration.spec.ts  ✅ CRIADO
│
├── delivery/
│   ├── src/
│   └── test/
│       └── integration/
│           └── delivery.integration.spec.ts  ✅ CRIADO
│
├── suppliers/
│   ├── src/
│   └── test/
│       └── integration/
│           └── suppliers.integration.spec.ts  ✅ CRIADO
│
├── offers/
│   ├── src/
│   └── test/
│       └── integration/
│           └── offers.integration.spec.ts  ⏳ TODO
│
├── fiscal/
│   ├── src/
│   └── test/
│       └── integration/
│           └── fiscal.integration.spec.ts  ⏳ TODO
│
├── ocr/
│   ├── src/
│   └── test/
│       └── integration/
│           └── ocr.integration.spec.ts  ⏳ TODO
│
└── payments/
    ├── src/
    └── test/
        └── integration/
            └── payments.integration.spec.ts  ⏳ TODO
```

---

## 📝 Template de Teste de Integração

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ServiceModule } from '../../src/service/service.module';
import { CreateServiceDto } from '../../src/service/dto/create-service.dto';

describe('Service Integration Tests', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ServiceModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/resource', () => {
    it('should create a resource successfully', async () => {
      const createDto: CreateServiceDto = {
        // Dados de teste
      };

      const response = await request(app.getHttpServer())
        .post('/api/resource')
        .set('Authorization', 'Bearer test-token')
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toMatchObject(createDto);
    });

    it('should reject invalid data', async () => {
      const invalidDto = {
        // Dados inválidos
      };

      await request(app.getHttpServer())
        .post('/api/resource')
        .set('Authorization', 'Bearer test-token')
        .send(invalidDto)
        .expect(400);
    });

    it('should reject without authentication', async () => {
      const createDto: CreateServiceDto = {
        // Dados de teste
      };

      await request(app.getHttpServer())
        .post('/api/resource')
        .send(createDto)
        .expect(401);
    });
  });

  describe('GET /api/resource', () => {
    it('should list all resources', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/resource')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/resource/:id', () => {
    it('should return a resource by id', async () => {
      // Criar recurso
      const createDto: CreateServiceDto = { /* ... */ };
      const createResponse = await request(app.getHttpServer())
        .post('/api/resource')
        .set('Authorization', 'Bearer test-token')
        .send(createDto)
        .expect(201);

      const resourceId = createResponse.body.id;

      // Recuperar recurso
      const getResponse = await request(app.getHttpServer())
        .get(`/api/resource/${resourceId}`)
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(getResponse.body.id).toBe(resourceId);
    });

    it('should return 404 for non-existent resource', async () => {
      await request(app.getHttpServer())
        .get('/api/resource/non-existent-id')
        .set('Authorization', 'Bearer test-token')
        .expect(404);
    });
  });

  describe('PUT /api/resource/:id', () => {
    it('should update a resource successfully', async () => {
      // Criar recurso
      const createDto: CreateServiceDto = { /* ... */ };
      const createResponse = await request(app.getHttpServer())
        .post('/api/resource')
        .set('Authorization', 'Bearer test-token')
        .send(createDto)
        .expect(201);

      const resourceId = createResponse.body.id;

      // Atualizar recurso
      const updateDto = { /* Dados atualizados */ };
      const updateResponse = await request(app.getHttpServer())
        .put(`/api/resource/${resourceId}`)
        .set('Authorization', 'Bearer test-token')
        .send(updateDto)
        .expect(200);

      expect(updateResponse.body.id).toBe(resourceId);
    });
  });

  describe('DELETE /api/resource/:id', () => {
    it('should delete a resource successfully', async () => {
      // Criar recurso
      const createDto: CreateServiceDto = { /* ... */ };
      const createResponse = await request(app.getHttpServer())
        .post('/api/resource')
        .set('Authorization', 'Bearer test-token')
        .send(createDto)
        .expect(201);

      const resourceId = createResponse.body.id;

      // Deletar recurso
      await request(app.getHttpServer())
        .delete(`/api/resource/${resourceId}`)
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      // Verificar que foi deletado
      await request(app.getHttpServer())
        .get(`/api/resource/${resourceId}`)
        .set('Authorization', 'Bearer test-token')
        .expect(404);
    });
  });
});
```

---

## ✅ Checklist de Implementação

### Serviços Completos
- [x] Sales - `services/sales/test/integration/sales.integration.spec.ts`
- [x] Inventory - `services/inventory/test/integration/inventory.integration.spec.ts`
- [x] Delivery - `services/delivery/test/integration/delivery.integration.spec.ts`
- [x] Suppliers - `services/suppliers/test/integration/suppliers.integration.spec.ts`

### Serviços Pendentes
- [ ] Offers - `services/offers/test/integration/offers.integration.spec.ts`
- [ ] Fiscal - `services/fiscal/test/integration/fiscal.integration.spec.ts`
- [ ] OCR - `services/ocr/test/integration/ocr.integration.spec.ts`
- [ ] Payments - `services/payments/test/integration/payments.integration.spec.ts`

---

## 🎯 Próximos Passos

### 1. Completar Integration Tests (4 serviços)
```bash
# Criar arquivos para:
# - Offers
# - Fiscal
# - OCR
# - Payments
```

### 2. Testar Kafka Integration
```typescript
// Verificar que eventos Kafka são publicados
expect(mockProducer.publishEvent).toHaveBeenCalled();
```

### 3. Testar Service-to-Service Calls
```typescript
// Testar chamadas HTTP entre serviços
const response = await request(app.getHttpServer())
  .post('/api/sales')
  .send(createSaleDto)
  .expect(201);

// Verificar que inventory foi atualizado
```

### 4. Testar Fluxos Completos
```typescript
// Exemplo: Criar venda → Atualizar inventário → Criar entrega
```

---

## 📊 Métricas de Sucesso

| Métrica | Target | Status |
|---------|--------|--------|
| Integration Tests | 8 serviços | 4/8 ✅ |
| Cobertura | 80%+ | ⏳ |
| Testes Passando | 100% | ⏳ |
| Tempo de Execução | <5min | ⏳ |

---

## 💡 Dicas

1. **Use o template** - Reutilize o template para novos serviços
2. **Teste autenticação** - Sempre teste com e sem JWT
3. **Teste validação** - Sempre teste dados inválidos
4. **Teste erros** - Sempre teste casos de erro (404, 400, etc)
5. **Teste fluxos** - Teste fluxos completos (create → read → update → delete)

---

## 🚀 Como Começar

1. Copie o template acima
2. Adapte para o serviço específico
3. Crie o arquivo em `services/[service]/test/integration/[service].integration.spec.ts`
4. Rode os testes: `npm run test:integration`
5. Corrija os testes falhando

---

**Próximo passo**: Implementar integration tests para Offers, Fiscal, OCR e Payments 🚀

