import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('Payment Webhook Flow (E2E)', () => {
  let app: INestApplication;
  let paymentId: string;
  let externalId: string;

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

  describe('Payment Processing and Webhooks', () => {
    it('should process payment and handle webhook correctly', async () => {
      // Step 1: Create payment
      const createResponse = await request(app.getHttpServer())
        .post('/api/payments/process')
        .send({
          orderId: 'order-123',
          amount: 100.0,
          paymentMethod: 'credit_card',
          description: 'Test payment',
          customerEmail: 'customer@example.com',
          customerName: 'John Doe',
        })
        .expect(201);

      paymentId = createResponse.body.id;
      externalId = createResponse.body.externalId;
      expect(createResponse.body.status).toBe('PROCESSING');

      // Step 2: Simulate webhook from MercadoPago
      const webhookData = {
        id: externalId,
        status: 'approved',
        external_reference: 'order-123',
      };

      // Step 3: Handle webhook
      await request(app.getHttpServer())
        .post('/api/payments/webhook')
        .send(webhookData)
        .expect(200);

      // Step 4: Verify payment status updated
      const getResponse = await request(app.getHttpServer())
        .get(`/api/payments/${paymentId}`)
        .expect(200);

      expect(getResponse.body.status).toBe('COMPLETED');
    });

    it('should handle payment failure webhook', async () => {
      // Step 1: Create payment
      const createResponse = await request(app.getHttpServer())
        .post('/api/payments/process')
        .send({
          orderId: 'order-456',
          amount: 50.0,
          paymentMethod: 'credit_card',
          description: 'Test payment',
          customerEmail: 'customer@example.com',
          customerName: 'Jane Doe',
        })
        .expect(201);

      paymentId = createResponse.body.id;
      externalId = createResponse.body.externalId;

      // Step 2: Simulate failure webhook
      const webhookData = {
        id: externalId,
        status: 'rejected',
        external_reference: 'order-456',
      };

      // Step 3: Handle webhook
      await request(app.getHttpServer())
        .post('/api/payments/webhook')
        .send(webhookData)
        .expect(200);

      // Step 4: Verify payment status is FAILED
      const getResponse = await request(app.getHttpServer())
        .get(`/api/payments/${paymentId}`)
        .expect(200);

      expect(getResponse.body.status).toBe('FAILED');
    });

    it('should refund completed payment', async () => {
      // Step 1: Create and complete payment
      const createResponse = await request(app.getHttpServer())
        .post('/api/payments/process')
        .send({
          orderId: 'order-789',
          amount: 200.0,
          paymentMethod: 'credit_card',
          description: 'Test payment',
          customerEmail: 'customer@example.com',
          customerName: 'Bob Smith',
        })
        .expect(201);

      paymentId = createResponse.body.id;
      externalId = createResponse.body.externalId;

      // Step 2: Simulate approval webhook
      const webhookData = {
        id: externalId,
        status: 'approved',
        external_reference: 'order-789',
      };

      await request(app.getHttpServer())
        .post('/api/payments/webhook')
        .send(webhookData)
        .expect(200);

      // Step 3: Refund payment
      const refundResponse = await request(app.getHttpServer())
        .post(`/api/payments/${paymentId}/refund`)
        .send({
          reason: 'Customer requested refund',
        })
        .expect(200);

      expect(refundResponse.body.status).toBe('REFUNDED');

      // Step 4: Verify payment is refunded
      const getResponse = await request(app.getHttpServer())
        .get(`/api/payments/${paymentId}`)
        .expect(200);

      expect(getResponse.body.status).toBe('REFUNDED');
    });

    it('should prevent refund of non-completed payment', async () => {
      // Create payment (stays in PROCESSING)
      const createResponse = await request(app.getHttpServer())
        .post('/api/payments/process')
        .send({
          orderId: 'order-999',
          amount: 100.0,
          paymentMethod: 'credit_card',
          description: 'Test payment',
          customerEmail: 'customer@example.com',
          customerName: 'Alice Johnson',
        })
        .expect(201);

      paymentId = createResponse.body.id;

      // Try to refund non-completed payment
      await request(app.getHttpServer())
        .post(`/api/payments/${paymentId}/refund`)
        .send({
          reason: 'Customer requested refund',
        })
        .expect(400);
    });

    it('should validate refund reason length', async () => {
      // Create and complete payment
      const createResponse = await request(app.getHttpServer())
        .post('/api/payments/process')
        .send({
          orderId: 'order-111',
          amount: 100.0,
          paymentMethod: 'credit_card',
          description: 'Test payment',
          customerEmail: 'customer@example.com',
          customerName: 'Charlie Brown',
        })
        .expect(201);

      paymentId = createResponse.body.id;
      externalId = createResponse.body.externalId;

      // Approve payment
      const webhookData = {
        id: externalId,
        status: 'approved',
        external_reference: 'order-111',
      };

      await request(app.getHttpServer())
        .post('/api/payments/webhook')
        .send(webhookData)
        .expect(200);

      // Try to refund with short reason
      await request(app.getHttpServer())
        .post(`/api/payments/${paymentId}/refund`)
        .send({
          reason: 'Short', // Too short
        })
        .expect(400);
    });

    it('should list payments by status', async () => {
      // Create multiple payments
      await request(app.getHttpServer())
        .post('/api/payments/process')
        .send({
          orderId: 'order-list-1',
          amount: 100.0,
          paymentMethod: 'credit_card',
          description: 'Test payment',
          customerEmail: 'customer@example.com',
          customerName: 'User 1',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/payments/process')
        .send({
          orderId: 'order-list-2',
          amount: 200.0,
          paymentMethod: 'credit_card',
          description: 'Test payment',
          customerEmail: 'customer@example.com',
          customerName: 'User 2',
        })
        .expect(201);

      // List payments
      const listResponse = await request(app.getHttpServer())
        .get('/api/payments')
        .expect(200);

      expect(listResponse.body).toBeInstanceOf(Array);
      expect(listResponse.body.length).toBeGreaterThan(0);
    });
  });
});
