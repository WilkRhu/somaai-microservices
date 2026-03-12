import { Test, TestingModule } from '@nestjs/testing';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';

describe('SalesController', () => {
  let controller: SalesController;
  let service: SalesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesController],
      providers: [
        {
          provide: SalesService,
          useValue: {
            createSale: jest.fn(),
            getSaleById: jest.fn(),
            listSales: jest.fn(),
            updateSale: jest.fn(),
            deleteSale: jest.fn(),
          },
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
        customerId: 'customer-123',
        items: [{ productId: 'prod-1', quantity: 2, unitPrice: 50 }],
        totalAmount: 100,
      };

      const expectedResult = { id: 'sale-123', ...createSaleDto };

      jest.spyOn(service, 'createSale').mockResolvedValue(expectedResult);

      const result = await controller.createSale(createSaleDto);

      expect(result).toEqual(expectedResult);
      expect(service.createSale).toHaveBeenCalledWith(createSaleDto);
    });
  });

  describe('getSale', () => {
    it('should return a sale by id', async () => {
      const saleId = 'sale-123';
      const expectedResult = { id: saleId, customerId: 'customer-123', totalAmount: 100 };

      jest.spyOn(service, 'getSaleById').mockResolvedValue(expectedResult);

      const result = await controller.getSale(saleId);

      expect(result).toEqual(expectedResult);
      expect(service.getSaleById).toHaveBeenCalledWith(saleId);
    });
  });

  describe('listSales', () => {
    it('should return list of sales', async () => {
      const expectedResult = [
        { id: 'sale-1', customerId: 'customer-1', totalAmount: 100 },
        { id: 'sale-2', customerId: 'customer-2', totalAmount: 200 },
      ];

      jest.spyOn(service, 'listSales').mockResolvedValue(expectedResult);

      const result = await controller.listSales();

      expect(result).toEqual(expectedResult);
      expect(service.listSales).toHaveBeenCalled();
    });
  });

  describe('deleteSale', () => {
    it('should delete a sale', async () => {
      const saleId = 'sale-123';

      jest.spyOn(service, 'deleteSale').mockResolvedValue(undefined);

      const result = await controller.deleteSale(saleId);

      expect(result).toEqual({ success: true });
      expect(service.deleteSale).toHaveBeenCalledWith(saleId);
    });
  });
});
