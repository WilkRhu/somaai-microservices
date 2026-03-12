import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { DeliveryModule } from '../../src/delivery/delivery.module';
import { CreateDeliveryDto } from '../../src/delivery/dto/create-delivery.dto';

describe('Delivery Integration Tests', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [DeliveryModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/deliveries', () => {
    it('should create a delivery successfully', async () => {
      const createDto: CreateDeliveryDto = {
        saleId: 'sale-123',
        estimatedDate: new Date(Date.now() + 86400000).toISOString(),
      };

      const response = await request(app.getHttpServer())
        .post('/api/deliveries')
        .set('Authorization', 'Bearer test-token')
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.saleId).toBe(createDto.saleId);
      expect(response.body).toHaveProperty('trackingCode');
      expect(response.body.status).toBe('PENDING');
    });

    it('should reject invalid delivery data', async () => {
      const invalidDto = {
        saleId: 'sale-123',
        // Missing estimatedDate
      };

      await request(app.getHttpServer())
        .post('/api/deliveries')
        .set('Authorization', 'Bearer test-token')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /api/deliveries', () => {
    it('should list all deliveries', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/deliveries')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by saleId', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/deliveries?saleId=sale-123')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/deliveries/:id', () => {
    it('should return a delivery by id', async () => {
      const createDto: CreateDeliveryDto = {
        saleId: 'sale-123',
        estimatedDate: new Date(Date.now() + 86400000).toISOString(),
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/deliveries')
        .set('Authorization', 'Bearer test-token')
        .send(createDto)
        .expect(201);

      const deliveryId = createResponse.body.id;

      const getResponse = await request(app.getHttpServer())
        .get(`/api/deliveries/${deliveryId}`)
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(getResponse.body.id).toBe(deliveryId);
      expect(getResponse.body.saleId).toBe(createDto.saleId);
    });

    it('should return 404 for non-existent delivery', async () => {
      await request(app.getHttpServer())
        .get('/api/deliveries/non-existent-id')
        .set('Authorization', 'Bearer test-token')
        .expect(404);
    });
  });

  describe('PUT /api/deliveries/:id', () => {
    it('should update a delivery successfully', async () => {
      const createDto: CreateDeliveryDto = {
        saleId: 'sale-123',
        estimatedDate: new Date(Date.now() + 86400000).toISOString(),
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/deliveries')
        .set('Authorization', 'Bearer test-token')
        .send(createDto)
        .expect(201);

      const deliveryId = createResponse.body.id;

      const updateDto = { status: 'IN_TRANSIT' };

      const updateResponse = await request(app.getHttpServer())
        .put(`/api/deliveries/${deliveryId}`)
        .set('Authorization', 'Bearer test-token')
        .send(updateDto)
        .expect(200);

      expect(updateResponse.body.id).toBe(deliveryId);
      expect(updateResponse.body.status).toBe('IN_TRANSIT');
    });
  });

  describe('GET /api/deliveries/:id/track', () => {
    it('should track a delivery', async () => {
      const createDto: CreateDeliveryDto = {
        saleId: 'sale-123',
        estimatedDate: new Date(Date.now() + 86400000).toISOString(),
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/deliveries')
        .set('Authorization', 'Bearer test-token')
        .send(createDto)
        .expect(201);

      const deliveryId = createResponse.body.id;

      const trackResponse = await request(app.getHttpServer())
        .get(`/api/deliveries/${deliveryId}/track`)
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(trackResponse.body.id).toBe(deliveryId);
      expect(trackResponse.body).toHaveProperty('trackingCode');
      expect(trackResponse.body).toHaveProperty('status');
    });
  });
});
