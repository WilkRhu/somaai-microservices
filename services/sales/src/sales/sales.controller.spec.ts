import { Test, TestingModule } from '@nestjs/testing';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';

describe('SalesController', () => {
  let controller: SalesController;
  let service: SalesService;

  const mockSalesService = {
    createSale: jest.fn(),
    getSale: jest.fn(),
    listSales: jest.fn(),
    updateSale: jest.fn(),
    deleteSale: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesController],
      providers: [
        {
          provide: SalesService,
          useValue: mockSalesService,
        },
      ],
    }).compile();

    controller = module.get<SalesController>(SalesController);
    service = module.get<SalesService>(SalesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSale', () => {
    it('should create a sale', async () => {
      const createSaleDto: CreateSaleDto = {
        customerId: 'cust-123',
        items: [{ productId: 'prod-001', quantity: 2, unitPrice: 100 }],
        totalAmount: 200,
      };

      const expectedResponse = {
        id: 'sale-123',
        ...createSaleDto,
        createdAt: new Date(),
      };

      mockSalesService.createSale.mockResolvedValue(expectedResponse);

      const result = await controller.createSale(createSaleDto);

      expect(result).toEqual(expectedResponse);
      expect(service.createSale).toHaveBeenCalledWith(createSaleDto);
    });
  });

  describe('getSale', () => {
    it('should get a sale by id', async () => {
      const saleId = 'sale-123';
      const expectedSale = {
        id: saleId,
        customerId: 'cust-123',
        items: [],
        totalAmount: 200,
      };

      mockSalesService.getSale.mockResolvedValue(expectedSale);

      const result = await controller.getSale(saleId);

      expect(result).toEqual(expectedSale);
      expect(service.getSale).toHaveBeenCalledWith(saleId);
    });
  });

  describe('listSales', () => {
    it('should list all sales', async () => {
      const expectedSales = [
        { id: 'sale-1', customerId: 'cust-123', items: [], totalAmount: 100 },
        { id: 'sale-2', customerId: 'cust-456', items: [], totalAmount: 200 },
      ];

      mockSalesService.listSales.mockResolvedValue(expectedSales);

      const result = await controller.listSales();

      expect(result).toEqual(expectedSales);
      expect(service.listSales).toHaveBeenCalled();
    });
  });
});
