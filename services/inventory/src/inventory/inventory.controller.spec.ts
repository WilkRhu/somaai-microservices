import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';

describe('InventoryController', () => {
  let controller: InventoryController;
  let service: InventoryService;

  const mockInventoryService = {
    createItem: jest.fn(),
    getItemById: jest.fn(),
    listItems: jest.fn(),
    updateQuantity: jest.fn(),
    decreaseQuantity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        {
          provide: InventoryService,
          useValue: mockInventoryService,
        },
      ],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
    service = module.get<InventoryService>(InventoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createItem', () => {
    it('should create an inventory item', async () => {
      const createDto: CreateInventoryItemDto = {
        productId: 'prod-001',
        quantity: 100,
        warehouseId: 'warehouse-1',
      };

      const expectedResponse = {
        id: 'inv-123',
        ...createDto,
        createdAt: new Date(),
      };

      mockInventoryService.createItem.mockResolvedValue(expectedResponse);

      const result = await controller.createItem(createDto);

      expect(result).toEqual(expectedResponse);
      expect(service.createItem).toHaveBeenCalledWith(createDto);
    });
  });

  describe('getItem', () => {
    it('should get an inventory item by id', async () => {
      const itemId = 'inv-123';
      const expectedItem = {
        id: itemId,
        productId: 'prod-001',
        quantity: 100,
        warehouseId: 'warehouse-1',
      };

      mockInventoryService.getItemById.mockResolvedValue(expectedItem);

      const result = await controller.getItem(itemId);

      expect(result).toEqual(expectedItem);
      expect(service.getItemById).toHaveBeenCalledWith(itemId);
    });
  });

  describe('listItems', () => {
    it('should list all inventory items', async () => {
      const expectedItems = [
        { id: 'inv-1', productId: 'prod-001', quantity: 100, warehouseId: 'warehouse-1' },
        { id: 'inv-2', productId: 'prod-002', quantity: 50, warehouseId: 'warehouse-1' },
      ];

      mockInventoryService.listItems.mockResolvedValue(expectedItems);

      const result = await controller.listItems();

      expect(result).toEqual(expectedItems);
      expect(service.listItems).toHaveBeenCalled();
    });

    it('should filter items by productId', async () => {
      const productId = 'prod-001';
      const expectedItems = [
        { id: 'inv-1', productId, quantity: 100, warehouseId: 'warehouse-1' },
      ];

      mockInventoryService.listItems.mockResolvedValue(expectedItems);

      const result = await controller.listItems(productId);

      expect(result).toEqual(expectedItems);
      expect(service.listItems).toHaveBeenCalledWith(productId);
    });
  });
});
