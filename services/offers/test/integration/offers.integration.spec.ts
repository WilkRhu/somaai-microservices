import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { OffersModule } from '../../src/offers/offers.module';
import { CreateOfferDto } from '../../src/offers/dto/create-offer.dto';
import { OfferStatus } from '../../src/offers/entities/offer.entity';

describe('Offers Integration Tests', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [OffersModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/offers', () => {
    it('should create an offer successfully', async () => {
      const createDto: CreateOfferDto = {
        name: 'Summer Sale',
        description: '50% off on all items',
        discountPercentage: 50,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
      };

      const response = await request(app.getHttpServer())
        .post('/api/offers')
        .set('Authorization', 'Bearer test-token')
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createDto.name);
      expect(response.body.discountPercentage).toBe(createDto.discountPercentage);
      expect(response.body.status).toBe(OfferStatus.ACTIVE);
    });

    it('should reject invalid offer data', async () => {
      const invalidDto = {
        name: 'Summer Sale',
        // Missing required fields
      };

      await request(app.getHttpServer())
        .post('/api/offers')
        .set('Authorization', 'Bearer test-token')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /api/offers', () => {
    it('should list all offers', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/offers')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by status', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/offers?status=${OfferStatus.ACTIVE}`)
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/offers/:id', () => {
    it('should return an offer by id', async () => {
      const createDto: CreateOfferDto = {
        name: 'Summer Sale',
        description: '50% off on all items',
        discountPercentage: 50,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/offers')
        .set('Authorization', 'Bearer test-token')
        .send(createDto)
        .expect(201);

      const offerId = createResponse.body.id;

      const getResponse = await request(app.getHttpServer())
        .get(`/api/offers/${offerId}`)
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(getResponse.body.id).toBe(offerId);
      expect(getResponse.body.name).toBe(createDto.name);
    });

    it('should return 404 for non-existent offer', async () => {
      await request(app.getHttpServer())
        .get('/api/offers/non-existent-id')
        .set('Authorization', 'Bearer test-token')
        .expect(404);
    });
  });

  describe('PATCH /api/offers/:id', () => {
    it('should update an offer successfully', async () => {
      const createDto: CreateOfferDto = {
        name: 'Summer Sale',
        description: '50% off on all items',
        discountPercentage: 50,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/offers')
        .set('Authorization', 'Bearer test-token')
        .send(createDto)
        .expect(201);

      const offerId = createResponse.body.id;

      const updateDto = { discountPercentage: 60 };

      const updateResponse = await request(app.getHttpServer())
        .patch(`/api/offers/${offerId}`)
        .set('Authorization', 'Bearer test-token')
        .send(updateDto)
        .expect(200);

      expect(updateResponse.body.id).toBe(offerId);
      expect(updateResponse.body.discountPercentage).toBe(60);
    });
  });

  describe('DELETE /api/offers/:id', () => {
    it('should delete an offer successfully', async () => {
      const createDto: CreateOfferDto = {
        name: 'Summer Sale',
        description: '50% off on all items',
        discountPercentage: 50,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/offers')
        .set('Authorization', 'Bearer test-token')
        .send(createDto)
        .expect(201);

      const offerId = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/api/offers/${offerId}`)
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/offers/${offerId}`)
        .set('Authorization', 'Bearer test-token')
        .expect(404);
    });
  });
});
