import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { FiscalModule } from '../../src/fiscal/fiscal.module';
import { GenerateNfceDto } from '../../src/fiscal/dto/generate-nfce.dto';
import { NfceStatus } from '../../src/fiscal/entities/nfce.entity';

describe('Fiscal Integration Tests', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [FiscalModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/nfce', () => {
    it('should generate an NFC-e successfully', async () => {
      const generateDto: GenerateNfceDto = {
        establishmentId: 'est-123',
        number: 1,
        series: 1,
        totalValue: 100.0,
      };

      const response = await request(app.getHttpServer())
        .post('/api/nfce')
        .set('Authorization', 'Bearer test-token')
        .send(generateDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.establishmentId).toBe(generateDto.establishmentId);
      expect(response.body.number).toBe(generateDto.number);
      expect(response.body.totalValue).toBe(generateDto.totalValue);
    });

    it('should reject invalid NFC-e data', async () => {
      const invalidDto = {
        establishmentId: 'est-123',
        // Missing required fields
      };

      await request(app.getHttpServer())
        .post('/api/nfce')
        .set('Authorization', 'Bearer test-token')
        .send(invalidDto)
        .expect(400);
    });

    it('should reject without authentication', async () => {
      const generateDto: GenerateNfceDto = {
        establishmentId: 'est-123',
        number: 1,
        series: 1,
        totalValue: 100.0,
      };

      await request(app.getHttpServer())
        .post('/api/nfce')
        .send(generateDto)
        .expect(401);
    });
  });

  describe('GET /api/nfce/:id', () => {
    it('should return an NFC-e by id', async () => {
      const generateDto: GenerateNfceDto = {
        establishmentId: 'est-123',
        number: 1,
        series: 1,
        totalValue: 100.0,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/nfce')
        .set('Authorization', 'Bearer test-token')
        .send(generateDto)
        .expect(201);

      const nfceId = createResponse.body.id;

      const getResponse = await request(app.getHttpServer())
        .get(`/api/nfce/${nfceId}`)
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(getResponse.body.id).toBe(nfceId);
      expect(getResponse.body.establishmentId).toBe(generateDto.establishmentId);
    });

    it('should return 404 for non-existent NFC-e', async () => {
      await request(app.getHttpServer())
        .get('/api/nfce/non-existent-id')
        .set('Authorization', 'Bearer test-token')
        .expect(404);
    });
  });

  describe('GET /api/nfce', () => {
    it('should list NFC-es by establishment', async () => {
      const establishmentId = 'est-123';

      const response = await request(app.getHttpServer())
        .get(`/api/nfce?establishmentId=${establishmentId}`)
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/nfce/:id/cancel', () => {
    it('should cancel an authorized NFC-e', async () => {
      const generateDto: GenerateNfceDto = {
        establishmentId: 'est-123',
        number: 1,
        series: 1,
        totalValue: 100.0,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/nfce')
        .set('Authorization', 'Bearer test-token')
        .send(generateDto)
        .expect(201);

      const nfceId = createResponse.body.id;

      const cancelDto = { justification: 'Cancelamento por erro' };

      const cancelResponse = await request(app.getHttpServer())
        .post(`/api/nfce/${nfceId}/cancel`)
        .set('Authorization', 'Bearer test-token')
        .send(cancelDto)
        .expect(200);

      expect(cancelResponse.body.id).toBe(nfceId);
      expect(cancelResponse.body.status).toBe(NfceStatus.CANCELLED);
    });

    it('should return 404 for non-existent NFC-e', async () => {
      const cancelDto = { justification: 'Cancelamento por erro' };

      await request(app.getHttpServer())
        .post('/api/nfce/non-existent-id/cancel')
        .set('Authorization', 'Bearer test-token')
        .send(cancelDto)
        .expect(404);
    });
  });
});
