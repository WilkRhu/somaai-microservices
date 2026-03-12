import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { SalesModule } from '../../src/sales/sales.module';
import { CreateSaleDto } from '../../src/sales/dto/create-sale.dto';

describe('Sales Integration Tests', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [SalesModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/sales', () => {
    it('should create a sale successfully', async () => {
      const createSaleDto: CreateSaleDto = {
        customerId: 'customer-123',
        items: [{ productId: 'prod-1', quantity: 2, unitPrice: 50 }],
        totalAmount: 100,
      };

      const response = await request(app.getHttpServer())
        .post('/api/sales')
        .set('Authorization', 'Bearer test-token')
        .send(createSaleDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.customerId).toBe(createSaleDto.customerId);
      expect(response.body.totalAmount).toBe(createSaleDto.totalAmount);
      expect(response.body.status).toBe('PENDING');
    });

    it('should reject invalid sale data', async () => {
      const invalidDto = {
        customerId: 'customer-123',
        // Missing required fields
      };

      await request(app.getHttpServer())
        .post('/api/sales')
        .set('Authorization', 'Bearer test-token')
        .send(invalidDto)
        .expect(400);
    });

    it('should reject request without authentication', async () => {
      const createSaleDto: CreateSaleDto = {
        customerId: 'customer-123',
        items: [{ productId: 'prod-1', quantity: 2, unitPrice: 50 }],
        totalAmount: 100,
      };

      await request(app.getHttpServer())
        .post('/api/sales')
        .send(createSaleDto)
        .expect(401);
    });
  });

  describe('GET /api/sales', () => {
    it('should list all sales', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/sales')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter sales by customerId', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/sales?customerId=customer-123')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/sales/:id', () => {
    it('should return a sale by id', async () => {
      // First create a sale
      const createSaleDto: CreateSaleDto = {
        customerId: 'customer-123',
        items: [{ productId: 'prod-1', quantity: 2, unitPrice: 50 }],
        totalAmount: 100,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/sales')
        .set('Authorization', 'Bearer test-token')
        .send(createSaleDto)
        .expect(201);

      const saleId = createResponse.body.id;

      // Then retrieve it
      const getResponse = await request(app.getHttpServer())
        .get(`/api/sales/${saleId}`)
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(getResponse.body.id).toBe(saleId);
      expect(getResponse.body.customerId).toBe(createSaleDto.customerId);
    });

    it('should return 404 for non-existent sale', async () => {
      await request(app.getHttpServer())
        .get('/api/sales/non-existent-id')
        .set('Authorization', 'Bearer test-token')
        .expect(404);
    });
  });

  describe('PUT /api/sales/:id', () => {
    it('should update a sale successfully', async () => {
      // First create a sale
      const createSaleDto: CreateSaleDto = {
        customerId: 'customer-123',
        items: [{ productId: 'prod-1', quantity: 2, unitPrice: 50 }],
        totalAmount: 100,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/sales')
        .set('Authorization', 'Bearer test-token')
        .send(createSaleDto)
        .expect(201);

      const saleId = createResponse.body.id;

      // Then update it
      const updateDto = { status: 'COMPLETED' };

      const updateResponse = await request(app.getHttpServer())
        .put(`/api/sales/${saleId}`)
        .set('Authorization', 'Bearer test-token')
        .send(updateDto)
        .expect(200);

      expect(updateResponse.body.id).toBe(saleId);
      expect(updateResponse.body.status).toBe('COMPLETED');
    });
  });

  describe('DELETE /api/sales/:id', () => {
    it('should delete a sale successfully', async () => {
      // First create a sale
      const createSaleDto: CreateSaleDto = {
        customerId: 'customer-123',
        items: [{ productId: 'prod-1', quantity: 2, unitPrice: 50 }],
        totalAmount: 100,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/sales')
        .set('Authorization', 'Bearer test-token')
        .send(createSaleDto)
        .expect(201);

      const saleId = createResponse.body.id;

      // Then delete it
      await request(app.getHttpServer())
        .delete(`/api/sales/${saleId}`)
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      // Verify it's deleted
      await request(app.getHttpServer())
        .get(`/api/sales/${saleId}`)
        .set('Authorization', 'Bearer test-token')
        .expect(404);
    });
  });
});
