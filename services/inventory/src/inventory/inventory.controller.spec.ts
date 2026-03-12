import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';

describe('InventoryController', () => {
  let controller: InventoryController;
  let service: InventoryService;

  beforeEach(async () => {
    const mockService = {
      createItem: jest.fn(),
      getItemById: jest.fn(),
      listItems: jest.fn(),
      updateItem: jest.fn(),
      deleteItem: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        {
          provide: InventoryService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
    service = module.get<InventoryService>(InventoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an inventory item', async () => {
      const createDto: CreateInventoryItemDto = {
        productId: 'prod-123',
        quantity: 100,
        minQuantity: 10,
        maxQuantity: 500,
      };

      const expectedResult = {
        id: 'item-123',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'createItem').mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(service.createItem).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return list of inventory items', async () => {
      const expectedResult = [
        { id: 'item-1', productId: 'prod-1', quantity: 100 },
        { id: 'item-2', productId: 'prod-2', quantity: 200 },
      ];

      jest.spyOn(service, 'listItems').mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(service.listItems).toHaveBeenCalled();
    });

    it('should filter by productId', async () => {
      const productId = 'prod-123';
      const expectedResult = [{ id: 'item-1', productId, quantity: 100 }];

      jest.spyOn(service, 'listItems').mockResolvedValue(expectedResult);

      const result = await controller.findAll(productId);

      expect(result).toEqual(expectedResult);
      expect(service.listItems).toHaveBeenCalledWith(productId);
    });
  });

  describe('findOne', () => {
    it('should return an inventory item by id', async () => {
      const itemId = 'item-123';
      const expectedResult = {
        id: itemId,
        productId: 'prod-123',
        quantity: 100,
      };

      jest.spyOn(service, 'getItemById').mockResolvedValue(expectedResult);

      const result = await controller.findOne(itemId);

      expect(result).toEqual(expectedResult);
      expect(service.getItemById).toHaveBeenCalledWith(itemId);
    });
  });

  describe('update', () => {
    it('should update an inventory item', async () => {
      const itemId = 'item-123';
      const updateDto: UpdateInventoryItemDto = { quantity: 150 };
      const expectedResult = {
        id: itemId,
        productId: 'prod-123',
        quantity: 150,
      };

      jest.spyOn(service, 'updateItem').mockResolvedValue(expectedResult);

      const result = await controller.update(itemId, updateDto);

      expect(result).toEqual(expectedResult);
      expect(service.updateItem).toHaveBeenCalledWith(itemId, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete an inventory item', async () => {
      const itemId = 'item-123';

      jest.spyOn(service, 'deleteItem').mockResolvedValue(undefined);

      await controller.remove(itemId);

      expect(service.deleteItem).toHaveBeenCalledWith(itemId);
    });
  });
});
