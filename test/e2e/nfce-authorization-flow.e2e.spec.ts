import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('NFC-e Authorization Flow (E2E)', () => {
  let app: INestApplication;
  let nfceId: string;

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

  describe('NFC-e Lifecycle', () => {
    it('should complete NFC-e authorization workflow', async () => {
      // Step 1: Generate NFC-e
      const generateResponse = await request(app.getHttpServer())
        .post('/api/fiscal/nfce')
        .send({
          establishmentId: 'est-123',
          number: 1,
          series: 1,
          totalValue: 100.0,
        })
        .expect(201);

      nfceId = generateResponse.body.id;
      expect(generateResponse.body.status).toBe('AUTHORIZED');
      expect(generateResponse.body.protocolNumber).toBeDefined();
      expect(generateResponse.body.authorizationCode).toBeDefined();
    });

    it('should handle NFC-e cancellation', async () => {
      // Step 1: Generate NFC-e
      const generateResponse = await request(app.getHttpServer())
        .post('/api/fiscal/nfce')
        .send({
          establishmentId: 'est-123',
          number: 2,
          series: 1,
          totalValue: 150.0,
        })
        .expect(201);

      nfceId = generateResponse.body.id;
      expect(generateResponse.body.status).toBe('AUTHORIZED');

      // Step 2: Cancel NFC-e
      const cancelResponse = await request(app.getHttpServer())
        .post(`/api/fiscal/nfce/${nfceId}/cancel`)
        .send({
          justification: 'Cancelamento por erro no documento',
        })
        .expect(200);

      expect(cancelResponse.body.status).toBe('CANCELLED');
    });

    it('should prevent cancellation of non-authorized NFC-e', async () => {
      // Try to cancel a non-existent NFC-e
      await request(app.getHttpServer())
        .post('/api/fiscal/nfce/non-existent-id/cancel')
        .send({
          justification: 'Cancelamento por erro no documento',
        })
        .expect(404);
    });

    it('should validate cancellation reason length', async () => {
      // Generate NFC-e
      const generateResponse = await request(app.getHttpServer())
        .post('/api/fiscal/nfce')
        .send({
          establishmentId: 'est-123',
          number: 3,
          series: 1,
          totalValue: 200.0,
        })
        .expect(201);

      nfceId = generateResponse.body.id;

      // Try to cancel with short reason
      await request(app.getHttpServer())
        .post(`/api/fiscal/nfce/${nfceId}/cancel`)
        .send({
          justification: 'Short', // Too short
        })
        .expect(400);
    });

    it('should validate NFC-e number and series', async () => {
      // Try to generate with invalid number
      await request(app.getHttpServer())
        .post('/api/fiscal/nfce')
        .send({
          establishmentId: 'est-123',
          number: -1, // Invalid
          series: 1,
          totalValue: 100.0,
        })
        .expect(400);

      // Try to generate with invalid series
      await request(app.getHttpServer())
        .post('/api/fiscal/nfce')
        .send({
          establishmentId: 'est-123',
          number: 1,
          series: 0, // Invalid
          totalValue: 100.0,
        })
        .expect(400);
    });

    it('should validate NFC-e value', async () => {
      // Try to generate with invalid value
      await request(app.getHttpServer())
        .post('/api/fiscal/nfce')
        .send({
          establishmentId: 'est-123',
          number: 1,
          series: 1,
          totalValue: -100.0, // Invalid
        })
        .expect(400);

      // Try to generate with zero value
      await request(app.getHttpServer())
        .post('/api/fiscal/nfce')
        .send({
          establishmentId: 'est-123',
          number: 1,
          series: 1,
          totalValue: 0, // Invalid
        })
        .expect(400);
    });

    it('should list NFC-es by establishment', async () => {
      // Generate multiple NFC-es
      await request(app.getHttpServer())
        .post('/api/fiscal/nfce')
        .send({
          establishmentId: 'est-456',
          number: 1,
          series: 1,
          totalValue: 100.0,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/fiscal/nfce')
        .send({
          establishmentId: 'est-456',
          number: 2,
          series: 1,
          totalValue: 200.0,
        })
        .expect(201);

      // List NFC-es
      const listResponse = await request(app.getHttpServer())
        .get('/api/fiscal/nfce?establishmentId=est-456')
        .expect(200);

      expect(listResponse.body).toBeInstanceOf(Array);
      expect(listResponse.body.length).toBeGreaterThan(0);
    });

    it('should get NFC-e by ID', async () => {
      // Generate NFC-e
      const generateResponse = await request(app.getHttpServer())
        .post('/api/fiscal/nfce')
        .send({
          establishmentId: 'est-789',
          number: 1,
          series: 1,
          totalValue: 300.0,
        })
        .expect(201);

      nfceId = generateResponse.body.id;

      // Get NFC-e
      const getResponse = await request(app.getHttpServer())
        .get(`/api/fiscal/nfce/${nfceId}`)
        .expect(200);

      expect(getResponse.body.id).toBe(nfceId);
      expect(getResponse.body.status).toBe('AUTHORIZED');
      expect(getResponse.body.totalValue).toBe(300.0);
    });
  });
});
