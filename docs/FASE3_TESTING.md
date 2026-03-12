# Fase 3 - Testing Guide

## Overview

This document provides a comprehensive guide for testing the SomaAI Microservices. The testing strategy includes unit tests, integration tests, and end-to-end tests with a target of 80%+ code coverage.

## Testing Structure

### Unit Tests

Unit tests focus on individual components in isolation:

- **Service Tests** (`*.service.spec.ts`): Test business logic
- **Controller Tests** (`*.controller.spec.ts`): Test HTTP endpoints
- **Producer Tests** (`*.producer.spec.ts`): Test Kafka message publishing

### Integration Tests

Integration tests verify interactions between components:

- Database operations with real repositories
- Kafka producer/consumer interactions
- Service-to-service communication

### Test Files Location

```
services/
├── sales/
│   └── src/
│       ├── sales/
│       │   ├── sales.service.spec.ts
│       │   └── sales.controller.spec.ts
│       └── kafka/
│           └── sales.producer.spec.ts
├── inventory/
│   └── src/
│       └── inventory/
│           ├── inventory.service.spec.ts
│           └── inventory.controller.spec.ts
├── delivery/
│   └── src/
│       └── delivery/
│           └── delivery.service.spec.ts
├── suppliers/
│   └── src/
│       └── suppliers/
│           └── suppliers.service.spec.ts
└── offers/
    └── src/
        └── offers/
            └── offers.service.spec.ts

test/
├── fixtures/
│   └── sale.fixture.ts
├── mocks/
│   ├── kafka.mock.ts
│   └── database.mock.ts
└── utils/
    └── test-setup.ts
```

## Running Tests

### Run all tests for a service

```bash
cd services/sales
npm run test
```

### Run tests with coverage

```bash
cd services/sales
npm run test:cov
```

### Run tests in watch mode

```bash
cd services/sales
npm run test:watch
```

### Run specific test file

```bash
cd services/sales
npm run test -- sales.service.spec.ts
```

### Run all services tests

```bash
for service in sales inventory delivery suppliers offers; do
  cd services/$service
  npm run test:cov
  cd ../..
done
```

## Test Utilities

### Fixtures

Fixtures provide reusable test data:

```typescript
import { createSaleFixture, saleEntityFixture } from '../../../test/fixtures/sale.fixture';

const saleDto = createSaleFixture();
const saleEntity = saleEntityFixture();
```

### Mocks

Mock objects for external dependencies:

```typescript
import { mockRepository } from '../../../test/mocks/database.mock';
import { mockKafkaProducer } from '../../../test/mocks/kafka.mock';

mockRepository.find.mockResolvedValue([]);
mockKafkaProducer.send.mockResolvedValue([]);
```

### Test Setup

Helper functions for test module creation:

```typescript
import { createTestingModule, createTestApp } from '../../../test/utils/test-setup';

const module = await createTestingModule(SalesModule);
const app = await createTestApp(SalesModule);
```

## Coverage Requirements

- **Minimum Coverage**: 80%
- **Target Coverage**: 90%+
- **Critical Paths**: 100%

### Coverage Report

Coverage reports are generated in `coverage/` directory:

```bash
cd services/sales
npm run test:cov
# Reports available in coverage/index.html
```

## Mocking Strategy

### Database Mocking

```typescript
const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

mockRepository.find.mockResolvedValue([]);
```

### Kafka Mocking

```typescript
const mockKafkaProducer = {
  connect: jest.fn().mockResolvedValue(undefined),
  send: jest.fn().mockResolvedValue([]),
};
```

### HTTP Client Mocking

```typescript
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
mockedAxios.get.mockResolvedValue({ data: {} });
```

## Test Examples

### Service Test

```typescript
describe('SalesService', () => {
  let service: SalesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [SalesService, /* mocked dependencies */],
    }).compile();
    service = module.get<SalesService>(SalesService);
  });

  it('should create a sale', async () => {
    const dto = { customerId: 'cust-123', totalAmount: 200 };
    const result = await service.createSale(dto);
    expect(result).toBeDefined();
  });
});
```

### Controller Test

```typescript
describe('SalesController', () => {
  let controller: SalesController;
  let service: SalesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [SalesController],
      providers: [{ provide: SalesService, useValue: mockService }],
    }).compile();
    controller = module.get<SalesController>(SalesController);
  });

  it('should create a sale', async () => {
    const dto = { customerId: 'cust-123', totalAmount: 200 };
    const result = await controller.createSale(dto);
    expect(result).toBeDefined();
  });
});
```

## Integration Testing

### Database Integration

```typescript
describe('Sales Integration', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [SalesModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should create and retrieve a sale', async () => {
    const response = await request(app.getHttpServer())
      .post('/sales')
      .send({ customerId: 'cust-123', totalAmount: 200 });
    
    expect(response.status).toBe(201);
  });
});
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Clarity**: Test names should describe what is being tested
3. **Mocking**: Mock external dependencies
4. **Coverage**: Aim for 80%+ coverage
5. **Performance**: Keep tests fast (< 5s per test)
6. **Cleanup**: Always clean up after tests

## Troubleshooting

### Tests Failing

1. Check mock setup
2. Verify test data
3. Review error messages
4. Check service dependencies

### Coverage Issues

1. Identify uncovered lines
2. Add tests for edge cases
3. Test error scenarios
4. Test async operations

### Performance Issues

1. Reduce test data size
2. Use mocks instead of real services
3. Parallelize tests
4. Profile slow tests

## CI/CD Integration

Tests run automatically on:

- Every push to `main` or `develop`
- Pull requests
- Before Docker image build
- Before deployment

See `.github/workflows/ci.yml` for details.
