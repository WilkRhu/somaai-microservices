import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SalesService } from './sales.service';
import { SaleEntity } from './entities/sale.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';

describe('SalesService', () => {
  let service: SalesService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: getRepositoryToken(SaleEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSale', () => {
    it('should create a sale successfully', async () => {
      const createSaleDto: CreateSaleDto = {
        customerId: 'customer-123',
        items: [{ productId: 'prod-1', quantity: 2, unitPrice: 50 }],
        totalAmount: 100,
      };

      const expectedSale = {
        id: 'sale-123',
        ...createSaleDto,
        status: 'PENDING',
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
        customerId: 'customer-123',
        items: [{ productId: 'prod-1', quantity: 2, unitPrice: 50 }],
        totalAmount: 100,
      };

      mockRepository.create.mockReturnValue(createSaleDto);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.createSale(createSaleDto)).rejects.toThrow('Database error');
    });
  });

  describe('getSaleById', () => {
    it('should return a sale by id', async () => {
      const saleId = 'sale-123';
      const expectedSale = {
        id: saleId,
        customerId: 'customer-123',
        totalAmount: 100,
        status: 'PENDING',
      };

      mockRepository.findOne.mockResolvedValue(expectedSale);

      const result = await service.getSaleById(saleId);

      expect(result).toEqual(expectedSale);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: saleId } });
    });

    it('should return null when sale not found', async () => {
      const saleId = 'non-existent';
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getSaleById(saleId);

      expect(result).toBeNull();
    });
  });

  describe('listSales', () => {
    it('should return list of sales', async () => {
      const expectedSales = [
        { id: 'sale-1', customerId: 'customer-1', totalAmount: 100 },
        { id: 'sale-2', customerId: 'customer-2', totalAmount: 200 },
      ];

      mockRepository.find.mockResolvedValue(expectedSales);

      const result = await service.listSales();

      expect(result).toEqual(expectedSales);
      expect(mockRepository.find).toHaveBeenCalled();
    });

    it('should filter sales by customerId', async () => {
      const customerId = 'customer-123';
      const expectedSales = [{ id: 'sale-1', customerId, totalAmount: 100 }];

      mockRepository.find.mockResolvedValue(expectedSales);

      const result = await service.listSales(customerId);

      expect(result).toEqual(expectedSales);
    });
  });

  describe('updateSale', () => {
    it('should update a sale successfully', async () => {
      const saleId = 'sale-123';
      const updateSaleDto: UpdateSaleDto = { status: 'COMPLETED' };
      const updatedSale = { id: saleId, ...updateSaleDto };

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(updatedSale);

      const result = await service.updateSale(saleId, updateSaleDto);

      expect(mockRepository.update).toHaveBeenCalledWith(saleId, updateSaleDto);
    });
  });

  describe('deleteSale', () => {
    it('should delete a sale successfully', async () => {
      const saleId = 'sale-123';

      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteSale(saleId);

      expect(mockRepository.delete).toHaveBeenCalledWith(saleId);
    });
  });
});
