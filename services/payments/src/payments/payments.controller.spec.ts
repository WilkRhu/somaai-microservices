import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentStatus } from './entities/payment.entity';
import { ProcessPaymentDto } from './dto/process-payment.dto';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: PaymentsService;

  beforeEach(async () => {
    const mockService = {
      processPayment: jest.fn(),
      getPaymentById: jest.fn(),
      listPayments: jest.fn(),
      refundPayment: jest.fn(),
      handleWebhook: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    service = module.get<PaymentsService>(PaymentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processPayment', () => {
    it('should process a payment', async () => {
      const processDto: ProcessPaymentDto = {
        orderId: 'order-123',
        amount: 100.0,
        paymentMethod: 'credit_card',
        description: 'Test payment',
        customerEmail: 'customer@example.com',
        customerName: 'John Doe',
      };

      const expectedResult = {
        id: 'payment-123',
        ...processDto,
        status: PaymentStatus.COMPLETED,
        transactionId: 'mp-123',
        externalId: 'mp-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'processPayment').mockResolvedValue(expectedResult);

      const result = await controller.processPayment(processDto);

      expect(result).toEqual(expectedResult);
      expect(service.processPayment).toHaveBeenCalledWith(processDto);
    });
  });

  describe('getPayment', () => {
    it('should return a payment by id', async () => {
      const paymentId = 'payment-123';
      const expectedResult = {
        id: paymentId,
        orderId: 'order-123',
        amount: 100.0,
        status: PaymentStatus.COMPLETED,
      };

      jest.spyOn(service, 'getPaymentById').mockResolvedValue(expectedResult);

      const result = await controller.getPayment(paymentId);

      expect(result).toEqual(expectedResult);
      expect(service.getPaymentById).toHaveBeenCalledWith(paymentId);
    });
  });

  describe('listPayments', () => {
    it('should return list of payments', async () => {
      const expectedResult = [
        { id: 'payment-1', orderId: 'order-1', status: PaymentStatus.COMPLETED },
        { id: 'payment-2', orderId: 'order-2', status: PaymentStatus.COMPLETED },
      ];

      jest.spyOn(service, 'listPayments').mockResolvedValue(expectedResult);

      const result = await controller.listPayments();

      expect(result).toEqual(expectedResult);
      expect(service.listPayments).toHaveBeenCalled();
    });

    it('should filter by orderId', async () => {
      const orderId = 'order-123';
      const expectedResult = [{ id: 'payment-1', orderId, status: PaymentStatus.COMPLETED }];

      jest.spyOn(service, 'listPayments').mockResolvedValue(expectedResult);

      const result = await controller.listPayments(orderId);

      expect(result).toEqual(expectedResult);
      expect(service.listPayments).toHaveBeenCalledWith(orderId);
    });
  });

  describe('refundPayment', () => {
    it('should refund a payment', async () => {
      const paymentId = 'payment-123';
      const expectedResult = {
        id: paymentId,
        orderId: 'order-123',
        status: PaymentStatus.REFUNDED,
      };

      jest.spyOn(service, 'refundPayment').mockResolvedValue(expectedResult);

      const result = await controller.refundPayment(paymentId);

      expect(result).toEqual(expectedResult);
      expect(service.refundPayment).toHaveBeenCalledWith(paymentId);
    });
  });

  describe('webhook', () => {
    it('should handle webhook', async () => {
      const webhookData = { id: 'mp-123', status: 'approved' };

      jest.spyOn(service, 'handleWebhook').mockResolvedValue(undefined);

      await controller.webhook(webhookData);

      expect(service.handleWebhook).toHaveBeenCalledWith(webhookData);
    });
  });
});
