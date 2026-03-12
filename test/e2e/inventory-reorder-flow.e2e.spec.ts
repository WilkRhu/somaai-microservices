import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('Inventory Reorder Flow (E2E)', () => {
  let app: INestApplication;
  let itemId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      // Import your app module here
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Inventory Stock Management', () => {
    it('should trigger low stock alert when quantity falls below minimum', async () => {
      // Step 1: Create inventory item
      const createResponse = await request(app.getHttpServer())
        .post('/api/business/inventory')
        .send({
          productId: 'prod-123',
          quantity: 100,
          minQuantity: 20,
          maxQuantity: 500,
        })
        .expect(201);

      itemId = createResponse.body.id;
      expect(createResponse.body.quantity).toBe(100);

      // Step 2: Reduce quantity below minimum
      const updateResponse = await request(app.getHttpServer())
        .patch(`/api/business/inventory/${itemId}`)
        .send({
          quantity: 15,
        })
        .expect(200);

      expect(updateResponse.body.quantity).toBe(15);

      // Step 3: Check stock levels
      const stockResponse = await request(app.getHttpServer())
        .get(`/api/business/inventory/${itemId}/stock-levels`)
        .expect(200);

      expect(stockResponse.body.isLowStock).toBe(true);
      expect(stockResponse.body.quantity).toBe(15);
      expect(stockResponse.body.minQuantity).toBe(20);
    });

    it('should identify items needing reorder', async () => {
      // Create multiple inventory items
      const item1Response = await request(app.getHttpServer())
        .post('/api/business/inventory')
        .send({
          productId: 'prod-1',
          quantity: 15,
          minQuantity: 20,
          maxQuantity: 100,
        })
        .expect(201);

      const item2Response = await request(app.getHttpServer())
        .post('/api/business/inventory')
        .send({
          productId: 'prod-2',
          quantity: 50,
          minQuantity: 20,
          maxQuantity: 100,
        })
        .expect(201);

      // Check reorder points
      const reorderResponse = await request(app.getHttpServer())
        .get('/api/business/inventory/reorder-points')
        .expect(200);

      expect(reorderResponse.body).toBeInstanceOf(Array);
      expect(reorderResponse.body.length).toBeGreaterThan(0);

      // Should include item1 (low stock)
      const lowStockItem = reorderResponse.body.find(
        (item: any) => item.id === item1Response.body.id,
      );
      expect(lowStockItem).toBeDefined();
      expect(lowStockItem.reorderQuantity).toBe(85); // maxQuantity - currentQuantity
    });

    it('should prevent negative quantity updates', async () => {
      // Create inventory item
      const createResponse = await request(app.getHttpServer())
        .post('/api/business/inventory')
        .send({
          productId: 'prod-123',
          quantity: 100,
          minQuantity: 20,
          maxQuantity: 500,
        })
        .expect(201);

      const itemId = createResponse.body.id;

      // Try to set negative quantity
      await request(app.getHttpServer())
        .patch(`/api/business/inventory/${itemId}`)
        .send({
          quantity: -10,
        })
        .expect(400);
    });

    it('should validate min/max quantity configuration', async () => {
      // Try to create item with invalid min/max
      await request(app.getHttpServer())
        .post('/api/business/inventory')
        .send({
          productId: 'prod-123',
          quantity: 100,
          minQuantity: 500, // min > max
          maxQuantity: 100,
        })
        .expect(400);
    });

    it('should prevent quantity exceeding maximum', async () => {
      // Create inventory item
      const createResponse = await request(app.getHttpServer())
        .post('/api/business/inventory')
        .send({
          productId: 'prod-123',
          quantity: 100,
          minQuantity: 20,
          maxQuantity: 500,
        })
        .expect(201);

      const itemId = createResponse.body.id;

      // Try to set quantity above maximum
      await request(app.getHttpServer())
        .patch(`/api/business/inventory/${itemId}`)
        .send({
          quantity: 600,
        })
        .expect(400);
    });
  });
});
