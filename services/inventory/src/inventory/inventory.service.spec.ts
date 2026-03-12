import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryItemEntity } from './entities/inventory-item.entity';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';

describe('InventoryService', () => {
  let service: InventoryService;
  let mockRepository: any;
  let mockProducer: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      remove: jest.fn(),
    };

    mockProducer = {
      publishInventoryUpdated: jest.fn().mockResolvedValue(undefined),
      publishLowStockAlert: jest.fn().mockResolvedValue(undefined),
      publishRestocked: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getRepositoryToken(InventoryItemEntity),
          useValue: mockRepository,
        },
        {
          provide: 'InventoryProducerService',
          useValue: mockProducer,
        },
      ],
    })
      .overrideProvider('InventoryProducerService')
      .useValue(mockProducer)
      .compile();

    service = module.get<InventoryService>(InventoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createItem', () => {
    it('should create an inventory item successfully', async () => {
      const createDto: CreateInventoryItemDto = {
        productId: 'prod-123',
        quantity: 100,
        minQuantity: 10,
        maxQuantity: 500,
      };

      const expectedItem = {
        id: 'item-123',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(expectedItem);
      mockRepository.save.mockResolvedValue(expectedItem);

      const result = await service.createItem(createDto);

      expect(result).toBeDefined();
      expect(mockRepository.create).toHaveBeenCalledWith({
        productId: createDto.productId,
        quantity: createDto.quantity,
        minQuantity: createDto.minQuantity,
        maxQuantity: createDto.maxQuantity,
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockProducer.publishInventoryUpdated).toHaveBeenCalled();
    });

    it('should throw error when creation fails', async () => {
      const createDto: CreateInventoryItemDto = {
        productId: 'prod-123',
        quantity: 100,
        minQuantity: 10,
        maxQuantity: 500,
      };

      mockRepository.create.mockReturnValue(createDto);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.createItem(createDto)).rejects.toThrow(HttpException);
    });
  });

  describe('getItemById', () => {
    it('should return an inventory item by id', async () => {
      const itemId = 'item-123';
      const expectedItem = {
        id: itemId,
        productId: 'prod-123',
        quantity: 100,
        minQuantity: 10,
        maxQuantity: 500,
      };

      mockRepository.findOne.mockResolvedValue(expectedItem);

      const result = await service.getItemById(itemId);

      expect(result).toBeDefined();
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: itemId } });
    });

    it('should throw NOT_FOUND when item does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getItemById('non-existent')).rejects.toThrow(HttpException);
    });
  });

  describe('listItems', () => {
    it('should return list of inventory items', async () => {
      const expectedItems = [
        { id: 'item-1', productId: 'prod-1', quantity: 100 },
        { id: 'item-2', productId: 'prod-2', quantity: 200 },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(expectedItems),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.listItems();

      expect(result).toEqual(expectedItems);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('item');
    });

    it('should filter items by productId', async () => {
      const productId = 'prod-123';
      const expectedItems = [{ id: 'item-1', productId, quantity: 100 }];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(expectedItems),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.listItems(productId);

      expect(result).toEqual(expectedItems);
      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });
  });

  describe('updateItem', () => {
    it('should update an inventory item successfully', async () => {
      const itemId = 'item-123';
      const updateDto: UpdateInventoryItemDto = { quantity: 150 };
      const existingItem = {
        id: itemId,
        productId: 'prod-123',
        quantity: 100,
        minQuantity: 10,
        maxQuantity: 500,
      };

      mockRepository.findOne.mockResolvedValue(existingItem);
      mockRepository.save.mockResolvedValue({ ...existingItem, ...updateDto });

      const result = await service.updateItem(itemId, updateDto);

      expect(result).toBeDefined();
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: itemId } });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockProducer.publishInventoryUpdated).toHaveBeenCalled();
    });

    it('should throw NOT_FOUND when item does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateItem('non-existent', {})).rejects.toThrow(HttpException);
    });
  });

  describe('deleteItem', () => {
    it('should delete an inventory item successfully', async () => {
      const itemId = 'item-123';
      const existingItem = { id: itemId, productId: 'prod-123', quantity: 100 };

      mockRepository.findOne.mockResolvedValue(existingItem);
      mockRepository.remove.mockResolvedValue(undefined);

      await service.deleteItem(itemId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: itemId } });
      expect(mockRepository.remove).toHaveBeenCalledWith(existingItem);
    });

    it('should throw NOT_FOUND when item does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteItem('non-existent')).rejects.toThrow(HttpException);
    });
  });

  describe('checkStockLevels', () => {
    it('should return low stock status when quantity is below minimum', async () => {
      const itemId = 'item-123';
      const item = {
        id: itemId,
        productId: 'prod-123',
        quantity: 5,
        minQuantity: 10,
        maxQuantity: 500,
      };

      mockRepository.findOne.mockResolvedValue(item);

      const result = await service.checkStockLevels(itemId);

      expect(result.isLowStock).toBe(true);
      expect(result.quantity).toBe(5);
      expect(result.minQuantity).toBe(10);
      expect(mockProducer.publishLowStockAlert).toHaveBeenCalled();
    });

    it('should return normal stock status when quantity is above minimum', async () => {
      const itemId = 'item-123';
      const item = {
        id: itemId,
        productId: 'prod-123',
        quantity: 100,
        minQuantity: 10,
        maxQuantity: 500,
      };

      mockRepository.findOne.mockResolvedValue(item);

      const result = await service.checkStockLevels(itemId);

      expect(result.isLowStock).toBe(false);
      expect(result.quantity).toBe(100);
      expect(mockProducer.publishLowStockAlert).not.toHaveBeenCalled();
    });

    it('should throw NOT_FOUND when item does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.checkStockLevels('non-existent')).rejects.toThrow(HttpException);
    });
  });

  describe('checkReorderPoints', () => {
    it('should return items that need reordering', async () => {
      const items = [
        { id: 'item-1', productId: 'prod-1', quantity: 5, minQuantity: 10, maxQuantity: 100 },
        { id: 'item-2', productId: 'prod-2', quantity: 50, minQuantity: 10, maxQuantity: 100 },
      ];

      mockRepository.find.mockResolvedValue(items);

      const result = await service.checkReorderPoints();

      expect(result.length).toBe(1);
      expect(result[0].id).toBe('item-1');
      expect(result[0].reorderQuantity).toBe(95);
      expect(mockProducer.publishLowStockAlert).toHaveBeenCalled();
    });

    it('should return empty array when no items need reordering', async () => {
      const items = [
        { id: 'item-1', productId: 'prod-1', quantity: 50, minQuantity: 10, maxQuantity: 100 },
      ];

      mockRepository.find.mockResolvedValue(items);

      const result = await service.checkReorderPoints();

      expect(result.length).toBe(0);
      expect(mockProducer.publishLowStockAlert).not.toHaveBeenCalled();
    });
  });
});
