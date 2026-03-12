import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { InventoryItemEntity } from './entities/inventory-item.entity';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { mockRepository } from '../../../test/mocks/database.mock';

describe('InventoryService', () => {
  let service: InventoryService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getRepositoryToken(InventoryItemEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  afterEach(async () => {
    await module.close();
    jest.clearAllMocks();
  });

  describe('createItem', () => {
    it('should create an inventory item', async () => {
      const createDto: CreateInventoryItemDto = {
        productId: 'prod-001',
        quantity: 100,
        warehouseId: 'warehouse-1',
      };

      const expectedItem = {
        id: 'inv-123',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(expectedItem);
      mockRepository.save.mockResolvedValue(expectedItem);

      const result = await service.createItem(createDto);

      expect(result).toEqual(expectedItem);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw error when quantity is negative', async () => {
      const createDto: CreateInventoryItemDto = {
        productId: 'prod-001',
        quantity: -10,
        warehouseId: 'warehouse-1',
      };

      mockRepository.create.mockImplementation(() => {
        throw new Error('Quantity must be positive');
      });

      await expect(service.createItem(createDto)).rejects.toThrow(
        'Quantity must be positive',
      );
    });
  });

  describe('getItemById', () => {
    it('should retrieve an inventory item by id', async () => {
      const itemId = 'inv-123';
      const expectedItem = {
        id: itemId,
        productId: 'prod-001',
        quantity: 100,
        warehouseId: 'warehouse-1',
      };

      mockRepository.findOne.mockResolvedValue(expectedItem);

      const result = await service.getItemById(itemId);

      expect(result).toEqual(expectedItem);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: itemId },
      });
    });

    it('should return null when item not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getItemById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('listItems', () => {
    it('should list all inventory items', async () => {
      const expectedItems = [
        { id: 'inv-1', productId: 'prod-001', quantity: 100, warehouseId: 'warehouse-1' },
        { id: 'inv-2', productId: 'prod-002', quantity: 50, warehouseId: 'warehouse-1' },
      ];

      mockRepository.find.mockResolvedValue(expectedItems);

      const result = await service.listItems();

      expect(result).toEqual(expectedItems);
      expect(mockRepository.find).toHaveBeenCalled();
    });

    it('should filter items by productId', async () => {
      const productId = 'prod-001';
      const expectedItems = [
        { id: 'inv-1', productId, quantity: 100, warehouseId: 'warehouse-1' },
      ];

      mockRepository.find.mockResolvedValue(expectedItems);

      const result = await service.listItems(productId);

      expect(result).toEqual(expectedItems);
      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ productId }),
        }),
      );
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', async () => {
      const itemId = 'inv-123';
      const newQuantity = 150;

      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateQuantity(itemId, newQuantity);

      expect(mockRepository.update).toHaveBeenCalledWith(itemId, {
        quantity: newQuantity,
      });
    });
  });

  describe('decreaseQuantity', () => {
    it('should decrease item quantity', async () => {
      const itemId = 'inv-123';
      const decreaseBy = 10;

      mockRepository.findOne.mockResolvedValue({
        id: itemId,
        quantity: 100,
      });

      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.decreaseQuantity(itemId, decreaseBy);

      expect(mockRepository.update).toHaveBeenCalledWith(itemId, {
        quantity: 90,
      });
    });

    it('should throw error when decreasing below zero', async () => {
      const itemId = 'inv-123';
      const decreaseBy = 150;

      mockRepository.findOne.mockResolvedValue({
        id: itemId,
        quantity: 100,
      });

      await expect(service.decreaseQuantity(itemId, decreaseBy)).rejects.toThrow(
        'Insufficient quantity',
      );
    });
  });
});
