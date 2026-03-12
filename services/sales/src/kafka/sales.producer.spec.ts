import { Test, TestingModule } from '@nestjs/testing';
import { SalesProducerService } from './sales.producer';
import { mockKafkaProducer } from '../../../test/mocks/kafka.mock';

describe('SalesProducerService', () => {
  let service: SalesProducerService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [SalesProducerService],
    }).compile();

    service = module.get<SalesProducerService>(SalesProducerService);
  });

  afterEach(async () => {
    await module.close();
    jest.clearAllMocks();
  });

  describe('publishSaleCreated', () => {
    it('should publish sale created event', async () => {
      const saleData = {
        id: 'sale-123',
        customerId: 'cust-123',
        totalAmount: 200,
        items: [{ productId: 'prod-001', quantity: 2, unitPrice: 100 }],
      };

      // Mock the producer
      jest.spyOn(service as any, 'producer', 'get').mockReturnValue(mockKafkaProducer);

      await service.publishSaleCreated(saleData);

      expect(mockKafkaProducer.send).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: 'sales.created',
          messages: expect.any(Array),
        }),
      );
    });

    it('should handle publish errors', async () => {
      const saleData = {
        id: 'sale-123',
        customerId: 'cust-123',
        totalAmount: 200,
      };

      const mockError = new Error('Kafka publish failed');
      mockKafkaProducer.send.mockRejectedValueOnce(mockError);

      jest.spyOn(service as any, 'producer', 'get').mockReturnValue(mockKafkaProducer);

      await expect(service.publishSaleCreated(saleData)).rejects.toThrow(
        'Kafka publish failed',
      );
    });
  });
});
