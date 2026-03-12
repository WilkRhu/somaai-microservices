import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PaymentsModule } from '../../src/payments/payments.module';
import { ProcessPaymentDto } from '../../src/payments/dto/process-payment.dto';
import { PaymentStatus } from '../../src/payments/entities/payment.entity';

describe('Payments Integration Tests', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [PaymentsModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/payments', () => {
    it('should process a payment successfully', async () => {
      const processDto: ProcessPaymentDto = {
        orderId: 'order-123',
        amount: 100.0,
        paymentMethod: 'credit_card',
        description: 'Test payment',
        customerEmail: 'customer@example.com',
        customerName: 'John Doe',
      };

      const response = await request(app.getHttpServer())
        .post('/api/payments')
        .set('Authorization', 'Bearer test-token')
        .send(processDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.orderId).toBe(processDto.orderId);
      expect(response.body.amount).toBe(processDto.amount);
      expect(response.body.paymentMethod).toBe(processDto.paymentMethod);
    });

    it('should reject invalid payment data', async () => {
      const invalidDto = {
        orderId: 'order-123',
        // Missing required fields
      };

      await request(app.getHttpServer())
        .post('/api/payments')
        .set('Authorization', 'Bearer test-token')
        .send(invalidDto)
        .expect(400);
    });

    it('should reject without authentication', async () => {
      const processDto: ProcessPaymentDto = {
        orderId: 'order-123',
        amount: 100.0,
        paymentMethod: 'credit_card',
        description: 'Test payment',
        customerEmail: 'customer@example.com',
        customerName: 'John Doe',
      };

      await request(app.getHttpServer())
        .post('/api/payments')
        .send(processDto)
        .expect(401);
    });
  });

  describe('GET /api/payments/:id', () => {
    it('should return a payment by id', async () => {
      const processDto: ProcessPaymentDto = {
        orderId: 'order-123',
        amount: 100.0,
        paymentMethod: 'credit_card',
        description: 'Test payment',
        customerEmail: 'customer@example.com',
        customerName: 'John Doe',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/payments')
        .set('Authorization', 'Bearer test-token')
        .send(processDto)
        .expect(201);

      const paymentId = createResponse.body.id;

      const getResponse = await request(app.getHttpServer())
        .get(`/api/payments/${paymentId}`)
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(getResponse.body.id).toBe(paymentId);
      expect(getResponse.body.orderId).toBe(processDto.orderId);
    });

    it('should return 404 for non-existent payment', async () => {
      await request(app.getHttpServer())
        .get('/api/payments/non-existent-id')
        .set('Authorization', 'Bearer test-token')
        .expect(404);
    });
  });

  describe('GET /api/payments', () => {
    it('should list all payments', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/payments')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by orderId', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/payments?orderId=order-123')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by status', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/payments?status=${PaymentStatus.COMPLETED}`)
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/payments/:id/refund', () => {
    it('should refund a completed payment', async () => {
      const processDto: ProcessPaymentDto = {
        orderId: 'order-123',
        amount: 100.0,
        paymentMethod: 'credit_card',
        description: 'Test payment',
        customerEmail: 'customer@example.com',
        customerName: 'John Doe',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/payments')
        .set('Authorization', 'Bearer test-token')
        .send(processDto)
        .expect(201);

      const paymentId = createResponse.body.id;

      const refundResponse = await request(app.getHttpServer())
        .post(`/api/payments/${paymentId}/refund`)
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(refundResponse.body.id).toBe(paymentId);
      expect(refundResponse.body.status).toBe(PaymentStatus.REFUNDED);
    });

    it('should return 404 for non-existent payment', async () => {
      await request(app.getHttpServer())
        .post('/api/payments/non-existent-id/refund')
        .set('Authorization', 'Bearer test-token')
        .expect(404);
    });
  });

  describe('POST /api/payments/webhook', () => {
    it('should handle webhook from payment provider', async () => {
      const webhookData = {
        id: 'mp-123',
        status: 'approved',
        orderId: 'order-123',
      };

      await request(app.getHttpServer())
        .post('/api/payments/webhook')
        .send(webhookData)
        .expect(200);
    });
  });
});
