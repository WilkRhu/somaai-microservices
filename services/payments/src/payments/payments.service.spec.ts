import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentEntity, PaymentStatus } from './entities/payment.entity';
import { ProcessPaymentDto } from './dto/process-payment.dto';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let mockRepository: any;
  let mockMercadopagoService: any;
  let mockProducer: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    mockMercadopagoService = {
      createPayment: jest.fn().mockResolvedValue({
        id: 'mp-123',
        status: 'approved',
      }),
      refundPayment: jest.fn().mockResolvedValue(undefined),
    };

    mockProducer = {
      publishPaymentInitiated: jest.fn().mockResolvedValue(undefined),
      publishPaymentCompleted: jest.fn().mockResolvedValue(undefined),
      publishPaymentFailed: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(PaymentEntity),
          useValue: mockRepository,
        },
        {
          provide: 'MercadopagoService',
          useValue: mockMercadopagoService,
        },
        {
          provide: 'PaymentsProducerService',
          useValue: mockProducer,
        },
      ],
    })
      .overrideProvider('MercadopagoService')
      .useValue(mockMercadopagoService)
      .overrideProvider('PaymentsProducerService')
      .useValue(mockProducer)
      .compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processPayment', () => {
    it('should process a payment successfully', async () => {
      const processDto: ProcessPaymentDto = {
        orderId: 'order-123',
        amount: 100.0,
        paymentMethod: 'credit_card',
        description: 'Test payment',
        customerEmail: 'customer@example.com',
        customerName: 'John Doe',
      };

      const expectedPayment = {
        id: 'payment-123',
        ...processDto,
        status: PaymentStatus.COMPLETED,
        transactionId: 'mp-123',
        externalId: 'mp-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(expectedPayment);
      mockRepository.save.mockResolvedValue(expectedPayment);

      const result = await service.processPayment(processDto);

      expect(result).toBeDefined();
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockMercadopagoService.createPayment).toHaveBeenCalled();
      expect(mockProducer.publishPaymentInitiated).toHaveBeenCalled();
      expect(mockProducer.publishPaymentCompleted).toHaveBeenCalled();
    });

    it('should handle payment failure', async () => {
      const processDto: ProcessPaymentDto = {
        orderId: 'order-123',
        amount: 100.0,
        paymentMethod: 'credit_card',
        description: 'Test payment',
        customerEmail: 'customer@example.com',
        customerName: 'John Doe',
      };

      mockRepository.create.mockReturnValue(processDto);
      mockRepository.save.mockResolvedValue(processDto);
      mockMercadopagoService.createPayment.mockRejectedValue(new Error('Payment failed'));

      await expect(service.processPayment(processDto)).rejects.toThrow(HttpException);
      expect(mockProducer.publishPaymentFailed).toHaveBeenCalled();
    });
  });

  describe('getPaymentById', () => {
    it('should return a payment by id', async () => {
      const paymentId = 'payment-123';
      const expectedPayment = {
        id: paymentId,
        orderId: 'order-123',
        amount: 100.0,
        status: PaymentStatus.COMPLETED,
      };

      mockRepository.findOne.mockResolvedValue(expectedPayment);

      const result = await service.getPaymentById(paymentId);

      expect(result).toBeDefined();
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: paymentId } });
    });

    it('should throw NOT_FOUND when payment does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getPaymentById('non-existent')).rejects.toThrow(HttpException);
    });
  });

  describe('listPayments', () => {
    it('should return list of payments', async () => {
      const expectedPayments = [
        { id: 'payment-1', orderId: 'order-1', status: PaymentStatus.COMPLETED },
        { id: 'payment-2', orderId: 'order-2', status: PaymentStatus.COMPLETED },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(expectedPayments),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.listPayments();

      expect(result).toEqual(expectedPayments);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('payment');
    });

    it('should filter by orderId', async () => {
      const orderId = 'order-123';
      const expectedPayments = [{ id: 'payment-1', orderId, status: PaymentStatus.COMPLETED }];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(expectedPayments),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.listPayments(orderId);

      expect(result).toEqual(expectedPayments);
      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });
  });

  describe('refundPayment', () => {
    it('should refund a completed payment', async () => {
      const paymentId = 'payment-123';
      const existingPayment = {
        id: paymentId,
        orderId: 'order-123',
        status: PaymentStatus.COMPLETED,
        externalId: 'mp-123',
      };

      mockRepository.findOne.mockResolvedValue(existingPayment);
      mockRepository.save.mockResolvedValue({ ...existingPayment, status: PaymentStatus.REFUNDED });

      const result = await service.refundPayment(paymentId);

      expect(result).toBeDefined();
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: paymentId } });
      expect(mockMercadopagoService.refundPayment).toHaveBeenCalledWith('mp-123');
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw error when trying to refund non-completed payment', async () => {
      const paymentId = 'payment-123';
      const existingPayment = {
        id: paymentId,
        status: PaymentStatus.PENDING,
      };

      mockRepository.findOne.mockResolvedValue(existingPayment);

      await expect(service.refundPayment(paymentId)).rejects.toThrow(HttpException);
    });
  });
});
