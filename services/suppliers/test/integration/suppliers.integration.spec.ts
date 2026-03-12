import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { SuppliersModule } from '../../src/suppliers/suppliers.module';
import { CreateSupplierDto } from '../../src/suppliers/dto/create-supplier.dto';

describe('Suppliers Integration Tests', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [SuppliersModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/suppliers', () => {
    it('should create a supplier successfully', async () => {
      const createDto: CreateSupplierDto = {
        name: 'Supplier Inc',
        cnpj: '12345678000190',
        email: 'supplier@example.com',
        phone: '1199999999',
        address: 'Rua Principal, 123',
      };

      const response = await request(app.getHttpServer())
        .post('/api/suppliers')
        .set('Authorization', 'Bearer test-token')
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createDto.name);
      expect(response.body.cnpj).toBe(createDto.cnpj);
    });

    it('should reject invalid supplier data', async () => {
      const invalidDto = {
        name: 'Supplier Inc',
        // Missing required fields
      };

      await request(app.getHttpServer())
        .post('/api/suppliers')
        .set('Authorization', 'Bearer test-token')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /api/suppliers', () => {
    it('should list all suppliers', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/suppliers')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/suppliers?name=Supplier')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/suppliers/:id', () => {
    it('should return a supplier by id', async () => {
      const createDto: CreateSupplierDto = {
        name: 'Supplier Inc',
        cnpj: '12345678000190',
        email: 'supplier@example.com',
        phone: '1199999999',
        address: 'Rua Principal, 123',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/suppliers')
        .set('Authorization', 'Bearer test-token')
        .send(createDto)
        .expect(201);

      const supplierId = createResponse.body.id;

      const getResponse = await request(app.getHttpServer())
        .get(`/api/suppliers/${supplierId}`)
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(getResponse.body.id).toBe(supplierId);
      expect(getResponse.body.name).toBe(createDto.name);
    });

    it('should return 404 for non-existent supplier', async () => {
      await request(app.getHttpServer())
        .get('/api/suppliers/non-existent-id')
        .set('Authorization', 'Bearer test-token')
        .expect(404);
    });
  });

  describe('PATCH /api/suppliers/:id', () => {
    it('should update a supplier successfully', async () => {
      const createDto: CreateSupplierDto = {
        name: 'Supplier Inc',
        cnpj: '12345678000190',
        email: 'supplier@example.com',
        phone: '1199999999',
        address: 'Rua Principal, 123',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/suppliers')
        .set('Authorization', 'Bearer test-token')
        .send(createDto)
        .expect(201);

      const supplierId = createResponse.body.id;

      const updateDto = { email: 'newemail@example.com' };

      const updateResponse = await request(app.getHttpServer())
        .patch(`/api/suppliers/${supplierId}`)
        .set('Authorization', 'Bearer test-token')
        .send(updateDto)
        .expect(200);

      expect(updateResponse.body.id).toBe(supplierId);
      expect(updateResponse.body.email).toBe('newemail@example.com');
    });
  });

  describe('DELETE /api/suppliers/:id', () => {
    it('should delete a supplier successfully', async () => {
      const createDto: CreateSupplierDto = {
        name: 'Supplier Inc',
        cnpj: '12345678000190',
        email: 'supplier@example.com',
        phone: '1199999999',
        address: 'Rua Principal, 123',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/suppliers')
        .set('Authorization', 'Bearer test-token')
        .send(createDto)
        .expect(201);

      const supplierId = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/api/suppliers/${supplierId}`)
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/suppliers/${supplierId}`)
        .set('Authorization', 'Bearer test-token')
        .expect(404);
    });
  });
});
