import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SalesService } from './sales.service';
import { SaleEntity } from './entities/sale.entity';
import { SalesProducerService } from '../kafka/sales.producer';
import { CreateSaleDto } from './dto/create-sale.dto';
import { mockRepository } from '../../../test/mocks/database.mock';
import { mockKafkaProducer } from '../../../test/mocks/kafka.mock';

describe('SalesService', () => {
  let service: SalesService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: getRepositoryToken(SaleEntity),
          useValue: mockRepository,
        },
        {
          provide: SalesProducerService,
          useValue: {
            publishSaleCreated: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
  });

  afterEach(async () => {
    await module.close();
    jest.clearAllMocks();
  });

  describe('createSale', () => {
    it('should create a sale successfully', async () => {
      const createSaleDto: CreateSaleDto = {
        customerId: 'cust-123',
        items: [{ productId: 'prod-001', quantity: 2, unitPrice: 100 }],
        totalAmount: 200,
      };

      const expectedSale = {
        id: 'sale-123',
        ...createSaleDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(expectedSale);
      mockRepository.save.mockResolvedValue(expectedSale);

      const result = await service.createSale(createSaleDto);

      expect(result).toEqual(expectedSale);
      expect(mockRepository.create).toHaveBeenCalledWith(createSaleDto);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw error when creating sale fails', async () => {
      const createSaleDto: CreateSaleDto = {
        customerId: 'cust-123',
        items: [{ productId: 'prod-001', quantity: 2, unitPrice: 100 }],
        totalAmount: 200,
      };

      mockRepository.create.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.createSale(createSaleDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('getSale', () => {
    it('should retrieve a sale by id', async () => {
      const saleId = 'sale-123';
      const expectedSale = {
        id: saleId,
        customerId: 'cust-123',
        items: [{ productId: 'prod-001', quantity: 2, unitPrice: 100 }],
        totalAmount: 200,
      };

      mockRepository.findOne.mockResolvedValue(expectedSale);

      const result = await service.getSale(saleId);

      expect(result).toEqual(expectedSale);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: saleId },
      });
    });

    it('should return null when sale not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getSale('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('listSales', () => {
    it('should list all sales', async () => {
      const expectedSales = [
        {
          id: 'sale-1',
          customerId: 'cust-123',
          items: [],
          totalAmount: 100,
        },
        {
          id: 'sale-2',
          customerId: 'cust-456',
          items: [],
          totalAmount: 200,
        },
      ];

      mockRepository.find.mockResolvedValue(expectedSales);

      const result = await service.listSales();

      expect(result).toEqual(expectedSales);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('updateSale', () => {
    it('should update a sale', async () => {
      const saleId = 'sale-123';
      const updateData = { totalAmount: 300 };

      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateSale(saleId, updateData);

      expect(mockRepository.update).toHaveBeenCalledWith(saleId, updateData);
    });
  });

  describe('deleteSale', () => {
    it('should delete a sale', async () => {
      const saleId = 'sale-123';

      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteSale(saleId);

      expect(mockRepository.delete).toHaveBeenCalledWith(saleId);
    });
  });
});
