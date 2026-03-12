import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { InventoryModule } from '../../src/inventory/inventory.module';
import { CreateInventoryItemDto } from '../../src/inventory/dto/create-inventory-item.dto';

describe('Inventory Integration Tests', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [InventoryModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/inventory', () => {
    it('should create an inventory item successfully', async () => {
      const createDto: CreateInventoryItemDto = {
        productId: 'prod-123',
        quantity: 100,
        minQuantity: 10,
        maxQuantity: 500,
      };

      const response = await request(app.getHttpServer())
        .post('/api/inventory')
        .set('Authorization', 'Bearer test-token')
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.productId).toBe(createDto.productId);
      expect(response.body.quantity).toBe(createDto.quantity);
    });

    it('should reject invalid inventory data', async () => {
      const invalidDto = {
        productId: 'prod-123',
        // Missing required fields
      };

      await request(app.getHttpServer())
        .post('/api/inventory')
        .set('Authorization', 'Bearer test-token')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /api/inventory', () => {
    it('should list all inventory items', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/inventory')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by productId', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/inventory?productId=prod-123')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/inventory/:id', () => {
    it('should return an inventory item by id', async () => {
      const createDto: CreateInventoryItemDto = {
        productId: 'prod-123',
        quantity: 100,
        minQuantity: 10,
        maxQuantity: 500,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/inventory')
        .set('Authorization', 'Bearer test-token')
        .send(createDto)
        .expect(201);

      const itemId = createResponse.body.id;

      const getResponse = await request(app.getHttpServer())
        .get(`/api/inventory/${itemId}`)
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(getResponse.body.id).toBe(itemId);
      expect(getResponse.body.productId).toBe(createDto.productId);
    });

    it('should return 404 for non-existent item', async () => {
      await request(app.getHttpServer())
        .get('/api/inventory/non-existent-id')
        .set('Authorization', 'Bearer test-token')
        .expect(404);
    });
  });

  describe('PUT /api/inventory/:id', () => {
    it('should update an inventory item successfully', async () => {
      const createDto: CreateInventoryItemDto = {
        productId: 'prod-123',
        quantity: 100,
        minQuantity: 10,
        maxQuantity: 500,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/inventory')
        .set('Authorization', 'Bearer test-token')
        .send(createDto)
        .expect(201);

      const itemId = createResponse.body.id;

      const updateDto = { quantity: 150 };

      const updateResponse = await request(app.getHttpServer())
        .put(`/api/inventory/${itemId}`)
        .set('Authorization', 'Bearer test-token')
        .send(updateDto)
        .expect(200);

      expect(updateResponse.body.id).toBe(itemId);
      expect(updateResponse.body.quantity).toBe(150);
    });
  });

  describe('DELETE /api/inventory/:id', () => {
    it('should delete an inventory item successfully', async () => {
      const createDto: CreateInventoryItemDto = {
        productId: 'prod-123',
        quantity: 100,
        minQuantity: 10,
        maxQuantity: 500,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/inventory')
        .set('Authorization', 'Bearer test-token')
        .send(createDto)
        .expect(201);

      const itemId = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/api/inventory/${itemId}`)
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/inventory/${itemId}`)
        .set('Authorization', 'Bearer test-token')
        .expect(404);
    });
  });
});
