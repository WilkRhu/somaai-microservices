import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeliveryService } from './delivery.service';
import { DeliveryEntity } from './entities/delivery.entity';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { mockRepository } from '../../../test/mocks/database.mock';

describe('DeliveryService', () => {
  let service: DeliveryService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        DeliveryService,
        {
          provide: getRepositoryToken(DeliveryEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DeliveryService>(DeliveryService);
  });

  afterEach(async () => {
    await module.close();
    jest.clearAllMocks();
  });

  describe('createDelivery', () => {
    it('should create a delivery', async () => {
      const createDto: CreateDeliveryDto = {
        orderId: 'order-123',
        recipientName: 'John Doe',
        address: 'Rua Principal, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
      };

      const expectedDelivery = {
        id: 'delivery-123',
        ...createDto,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(expectedDelivery);
      mockRepository.save.mockResolvedValue(expectedDelivery);

      const result = await service.createDelivery(createDto);

      expect(result).toEqual(expectedDelivery);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw error when address is invalid', async () => {
      const createDto: CreateDeliveryDto = {
        orderId: 'order-123',
        recipientName: 'John Doe',
        address: '',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
      };

      mockRepository.create.mockImplementation(() => {
        throw new Error('Address is required');
      });

      await expect(service.createDelivery(createDto)).rejects.toThrow(
        'Address is required',
      );
    });
  });

  describe('getDelivery', () => {
    it('should retrieve a delivery by id', async () => {
      const deliveryId = 'delivery-123';
      const expectedDelivery = {
        id: deliveryId,
        orderId: 'order-123',
        recipientName: 'John Doe',
        address: 'Rua Principal, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        status: 'PENDING',
      };

      mockRepository.findOne.mockResolvedValue(expectedDelivery);

      const result = await service.getDelivery(deliveryId);

      expect(result).toEqual(expectedDelivery);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: deliveryId },
      });
    });

    it('should return null when delivery not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getDelivery('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('listDeliveries', () => {
    it('should list all deliveries', async () => {
      const expectedDeliveries = [
        {
          id: 'delivery-1',
          orderId: 'order-123',
          recipientName: 'John Doe',
          status: 'PENDING',
        },
        {
          id: 'delivery-2',
          orderId: 'order-456',
          recipientName: 'Jane Smith',
          status: 'IN_TRANSIT',
        },
      ];

      mockRepository.find.mockResolvedValue(expectedDeliveries);

      const result = await service.listDeliveries();

      expect(result).toEqual(expectedDeliveries);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('updateDeliveryStatus', () => {
    it('should update delivery status', async () => {
      const deliveryId = 'delivery-123';
      const newStatus = 'IN_TRANSIT';

      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateDeliveryStatus(deliveryId, newStatus);

      expect(mockRepository.update).toHaveBeenCalledWith(deliveryId, {
        status: newStatus,
      });
    });
  });

  describe('getDeliveriesByOrderId', () => {
    it('should get deliveries by order id', async () => {
      const orderId = 'order-123';
      const expectedDeliveries = [
        {
          id: 'delivery-1',
          orderId,
          recipientName: 'John Doe',
          status: 'PENDING',
        },
      ];

      mockRepository.find.mockResolvedValue(expectedDeliveries);

      const result = await service.getDeliveriesByOrderId(orderId);

      expect(result).toEqual(expectedDeliveries);
      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ orderId }),
        }),
      );
    });
  });
});
