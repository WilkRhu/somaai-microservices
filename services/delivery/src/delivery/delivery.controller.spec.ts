import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { DeliveryStatus } from './entities/delivery.entity';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';

describe('DeliveryController', () => {
  let controller: DeliveryController;
  let service: DeliveryService;

  beforeEach(async () => {
    const mockService = {
      createDelivery: jest.fn(),
      getDeliveryById: jest.fn(),
      listDeliveries: jest.fn(),
      updateDelivery: jest.fn(),
      trackDelivery: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryController],
      providers: [
        {
          provide: DeliveryService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<DeliveryController>(DeliveryController);
    service = module.get<DeliveryService>(DeliveryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a delivery', async () => {
      const createDto: CreateDeliveryDto = {
        saleId: 'sale-123',
        estimatedDate: new Date().toISOString(),
      };

      const expectedResult = {
        id: 'delivery-123',
        ...createDto,
        trackingCode: 'TRACK-ABC123',
        status: DeliveryStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'createDelivery').mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(service.createDelivery).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return list of deliveries', async () => {
      const expectedResult = [
        { id: 'delivery-1', saleId: 'sale-1', status: DeliveryStatus.PENDING },
        { id: 'delivery-2', saleId: 'sale-2', status: DeliveryStatus.DELIVERED },
      ];

      jest.spyOn(service, 'listDeliveries').mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(service.listDeliveries).toHaveBeenCalled();
    });

    it('should filter by saleId', async () => {
      const saleId = 'sale-123';
      const expectedResult = [{ id: 'delivery-1', saleId, status: DeliveryStatus.PENDING }];

      jest.spyOn(service, 'listDeliveries').mockResolvedValue(expectedResult);

      const result = await controller.findAll(saleId);

      expect(result).toEqual(expectedResult);
      expect(service.listDeliveries).toHaveBeenCalledWith(saleId);
    });
  });

  describe('findOne', () => {
    it('should return a delivery by id', async () => {
      const deliveryId = 'delivery-123';
      const expectedResult = {
        id: deliveryId,
        saleId: 'sale-123',
        trackingCode: 'TRACK-ABC123',
        status: DeliveryStatus.PENDING,
      };

      jest.spyOn(service, 'getDeliveryById').mockResolvedValue(expectedResult);

      const result = await controller.findOne(deliveryId);

      expect(result).toEqual(expectedResult);
      expect(service.getDeliveryById).toHaveBeenCalledWith(deliveryId);
    });
  });

  describe('update', () => {
    it('should update a delivery', async () => {
      const deliveryId = 'delivery-123';
      const updateDto: UpdateDeliveryDto = { status: DeliveryStatus.IN_TRANSIT };
      const expectedResult = {
        id: deliveryId,
        saleId: 'sale-123',
        status: DeliveryStatus.IN_TRANSIT,
      };

      jest.spyOn(service, 'updateDelivery').mockResolvedValue(expectedResult);

      const result = await controller.update(deliveryId, updateDto);

      expect(result).toEqual(expectedResult);
      expect(service.updateDelivery).toHaveBeenCalledWith(deliveryId, updateDto);
    });
  });

  describe('track', () => {
    it('should return delivery tracking info', async () => {
      const deliveryId = 'delivery-123';
      const expectedResult = {
        id: deliveryId,
        saleId: 'sale-123',
        trackingCode: 'TRACK-ABC123',
        status: DeliveryStatus.IN_TRANSIT,
      };

      jest.spyOn(service, 'trackDelivery').mockResolvedValue(expectedResult);

      const result = await controller.track(deliveryId);

      expect(result).toEqual(expectedResult);
      expect(service.trackDelivery).toHaveBeenCalledWith(deliveryId);
    });
  });
});
