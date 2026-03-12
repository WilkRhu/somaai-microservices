import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('Complete Sales Flow (E2E)', () => {
  let app: INestApplication;
  let saleId: string;
  let customerId: string;
  let offerId: string;

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

  describe('Complete Sales Workflow', () => {
    it('should complete full sales workflow from creation to completion', async () => {
      // Step 1: Create sale
      const createSaleResponse = await request(app.getHttpServer())
        .post('/api/business/sales')
        .send({
          customerId: 'customer-123',
          totalAmount: 1000,
          items: [
            {
              productId: 'prod-1',
              quantity: 2,
              unitPrice: 500,
            },
          ],
        })
        .expect(201);

      saleId = createSaleResponse.body.id;
      expect(saleId).toBeDefined();
      expect(createSaleResponse.body.status).toBe('PENDING');

      // Step 2: Apply discount
      const discountResponse = await request(app.getHttpServer())
        .post(`/api/business/sales/${saleId}/discount`)
        .send({
          discountPercentage: 10,
        })
        .expect(200);

      expect(discountResponse.body.totalAmount).toBe(900);
      expect(discountResponse.body.discountApplied).toBe(10);

      // Step 3: Update status to CONFIRMED
      const confirmResponse = await request(app.getHttpServer())
        .patch(`/api/business/sales/${saleId}`)
        .send({
          status: 'CONFIRMED',
        })
        .expect(200);

      expect(confirmResponse.body.status).toBe('CONFIRMED');

      // Step 4: Process payment
      const paymentResponse = await request(app.getHttpServer())
        .post('/api/payments/process')
        .send({
          orderId: saleId,
          amount: 900,
          paymentMethod: 'credit_card',
          description: 'Sale payment',
          customerEmail: 'customer@example.com',
          customerName: 'John Doe',
        })
        .expect(201);

      expect(paymentResponse.body.status).toBe('COMPLETED');

      // Step 5: Update sale to PROCESSING
      const processingResponse = await request(app.getHttpServer())
        .patch(`/api/business/sales/${saleId}`)
        .send({
          status: 'PROCESSING',
        })
        .expect(200);

      expect(processingResponse.body.status).toBe('PROCESSING');

      // Step 6: Generate NFC-e
      const nfceResponse = await request(app.getHttpServer())
        .post('/api/fiscal/nfce')
        .send({
          establishmentId: 'est-123',
          number: 1,
          series: 1,
          totalValue: 900,
        })
        .expect(201);

      expect(nfceResponse.body.status).toBe('AUTHORIZED');

      // Step 7: Complete sale
      const completedResponse = await request(app.getHttpServer())
        .patch(`/api/business/sales/${saleId}`)
        .send({
          status: 'COMPLETED',
        })
        .expect(200);

      expect(completedResponse.body.status).toBe('COMPLETED');

      // Step 8: Verify final sale state
      const finalSaleResponse = await request(app.getHttpServer())
        .get(`/api/business/sales/${saleId}`)
        .expect(200);

      expect(finalSaleResponse.body.status).toBe('COMPLETED');
      expect(finalSaleResponse.body.totalAmount).toBe(900);
      expect(finalSaleResponse.body.discountApplied).toBe(10);
    });

    it('should handle invalid status transitions', async () => {
      // Create a sale
      const createResponse = await request(app.getHttpServer())
        .post('/api/business/sales')
        .send({
          customerId: 'customer-123',
          totalAmount: 1000,
          items: [
            {
              productId: 'prod-1',
              quantity: 1,
              unitPrice: 1000,
            },
          ],
        })
        .expect(201);

      const saleId = createResponse.body.id;

      // Try invalid transition: PENDING -> COMPLETED (should fail)
      await request(app.getHttpServer())
        .patch(`/api/business/sales/${saleId}`)
        .send({
          status: 'COMPLETED',
        })
        .expect(400);
    });

    it('should handle invalid discount percentage', async () => {
      // Create a sale
      const createResponse = await request(app.getHttpServer())
        .post('/api/business/sales')
        .send({
          customerId: 'customer-123',
          totalAmount: 1000,
          items: [
            {
              productId: 'prod-1',
              quantity: 1,
              unitPrice: 1000,
            },
          ],
        })
        .expect(201);

      const saleId = createResponse.body.id;

      // Try invalid discount: 150% (should fail)
      await request(app.getHttpServer())
        .post(`/api/business/sales/${saleId}/discount`)
        .send({
          discountPercentage: 150,
        })
        .expect(400);
    });
  });
});
