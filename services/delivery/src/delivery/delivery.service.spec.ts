import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { DeliveryEntity, DeliveryStatus } from './entities/delivery.entity';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';

describe('DeliveryService', () => {
  let service: DeliveryService;
  let mockRepository: any;
  let mockProducer: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    mockProducer = {
      publishDeliveryCreated: jest.fn().mockResolvedValue(undefined),
      publishDeliveryUpdated: jest.fn().mockResolvedValue(undefined),
      publishDeliveryCompleted: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryService,
        {
          provide: getRepositoryToken(DeliveryEntity),
          useValue: mockRepository,
        },
        {
          provide: 'DeliveryProducerService',
          useValue: mockProducer,
        },
      ],
    })
      .overrideProvider('DeliveryProducerService')
      .useValue(mockProducer)
      .compile();

    service = module.get<DeliveryService>(DeliveryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createDelivery', () => {
    it('should create a delivery successfully', async () => {
      const createDto: CreateDeliveryDto = {
        saleId: 'sale-123',
        estimatedDate: new Date().toISOString(),
      };

      const expectedDelivery = {
        id: 'delivery-123',
        saleId: createDto.saleId,
        trackingCode: 'TRACK-ABC123',
        status: DeliveryStatus.PENDING,
        estimatedDate: new Date(createDto.estimatedDate),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(expectedDelivery);
      mockRepository.save.mockResolvedValue(expectedDelivery);

      const result = await service.createDelivery(createDto);

      expect(result).toBeDefined();
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockProducer.publishDeliveryCreated).toHaveBeenCalled();
    });

    it('should throw error when creation fails', async () => {
      const createDto: CreateDeliveryDto = {
        saleId: 'sale-123',
        estimatedDate: new Date().toISOString(),
      };

      mockRepository.create.mockReturnValue(createDto);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.createDelivery(createDto)).rejects.toThrow(HttpException);
    });
  });

  describe('getDeliveryById', () => {
    it('should return a delivery by id', async () => {
      const deliveryId = 'delivery-123';
      const expectedDelivery = {
        id: deliveryId,
        saleId: 'sale-123',
        trackingCode: 'TRACK-ABC123',
        status: DeliveryStatus.PENDING,
      };

      mockRepository.findOne.mockResolvedValue(expectedDelivery);

      const result = await service.getDeliveryById(deliveryId);

      expect(result).toBeDefined();
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: deliveryId } });
    });

    it('should throw NOT_FOUND when delivery does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getDeliveryById('non-existent')).rejects.toThrow(HttpException);
    });
  });

  describe('listDeliveries', () => {
    it('should return list of deliveries', async () => {
      const expectedDeliveries = [
        { id: 'delivery-1', saleId: 'sale-1', status: DeliveryStatus.PENDING },
        { id: 'delivery-2', saleId: 'sale-2', status: DeliveryStatus.DELIVERED },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(expectedDeliveries),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.listDeliveries();

      expect(result).toEqual(expectedDeliveries);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('delivery');
    });

    it('should filter by saleId', async () => {
      const saleId = 'sale-123';
      const expectedDeliveries = [{ id: 'delivery-1', saleId, status: DeliveryStatus.PENDING }];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(expectedDeliveries),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.listDeliveries(saleId);

      expect(result).toEqual(expectedDeliveries);
      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });
  });

  describe('updateDelivery', () => {
    it('should update a delivery successfully', async () => {
      const deliveryId = 'delivery-123';
      const updateDto: UpdateDeliveryDto = { status: DeliveryStatus.IN_TRANSIT };
      const existingDelivery = {
        id: deliveryId,
        saleId: 'sale-123',
        status: DeliveryStatus.PENDING,
        trackingCode: 'TRACK-ABC123',
      };

      mockRepository.findOne.mockResolvedValue(existingDelivery);
      mockRepository.save.mockResolvedValue({ ...existingDelivery, ...updateDto });

      const result = await service.updateDelivery(deliveryId, updateDto);

      expect(result).toBeDefined();
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: deliveryId } });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockProducer.publishDeliveryUpdated).toHaveBeenCalled();
    });

    it('should throw NOT_FOUND when delivery does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateDelivery('non-existent', {})).rejects.toThrow(HttpException);
    });
  });

  describe('trackDelivery', () => {
    it('should return delivery tracking info', async () => {
      const deliveryId = 'delivery-123';
      const expectedDelivery = {
        id: deliveryId,
        saleId: 'sale-123',
        trackingCode: 'TRACK-ABC123',
        status: DeliveryStatus.IN_TRANSIT,
      };

      mockRepository.findOne.mockResolvedValue(expectedDelivery);

      const result = await service.trackDelivery(deliveryId);

      expect(result).toBeDefined();
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: deliveryId } });
    });

    it('should throw NOT_FOUND when delivery does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.trackDelivery('non-existent')).rejects.toThrow(HttpException);
    });
  });
});
