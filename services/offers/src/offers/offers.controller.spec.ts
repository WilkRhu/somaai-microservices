import { Test, TestingModule } from '@nestjs/testing';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { OfferStatus } from './entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

describe('OffersController', () => {
  let controller: OffersController;
  let service: OffersService;

  beforeEach(async () => {
    const mockService = {
      createOffer: jest.fn(),
      getOfferById: jest.fn(),
      listOffers: jest.fn(),
      updateOffer: jest.fn(),
      deleteOffer: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OffersController],
      providers: [
        {
          provide: OffersService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<OffersController>(OffersController);
    service = module.get<OffersService>(OffersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an offer', async () => {
      const createDto: CreateOfferDto = {
        name: 'Summer Sale',
        description: '50% off on all items',
        discountPercentage: 50,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
      };

      const expectedResult = {
        id: 'offer-123',
        ...createDto,
        status: OfferStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'createOffer').mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(service.createOffer).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return list of offers', async () => {
      const expectedResult = [
        { id: 'offer-1', name: 'Sale 1', discountPercentage: 50, status: OfferStatus.ACTIVE },
        { id: 'offer-2', name: 'Sale 2', discountPercentage: 30, status: OfferStatus.ACTIVE },
      ];

      jest.spyOn(service, 'listOffers').mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(service.listOffers).toHaveBeenCalled();
    });

    it('should filter by status', async () => {
      const status = OfferStatus.ACTIVE;
      const expectedResult = [{ id: 'offer-1', name: 'Sale 1', status }];

      jest.spyOn(service, 'listOffers').mockResolvedValue(expectedResult);

      const result = await controller.findAll(status);

      expect(result).toEqual(expectedResult);
      expect(service.listOffers).toHaveBeenCalledWith(status);
    });
  });

  describe('findOne', () => {
    it('should return an offer by id', async () => {
      const offerId = 'offer-123';
      const expectedResult = {
        id: offerId,
        name: 'Summer Sale',
        discountPercentage: 50,
        status: OfferStatus.ACTIVE,
      };

      jest.spyOn(service, 'getOfferById').mockResolvedValue(expectedResult);

      const result = await controller.findOne(offerId);

      expect(result).toEqual(expectedResult);
      expect(service.getOfferById).toHaveBeenCalledWith(offerId);
    });
  });

  describe('update', () => {
    it('should update an offer', async () => {
      const offerId = 'offer-123';
      const updateDto: UpdateOfferDto = { discountPercentage: 60 };
      const expectedResult = {
        id: offerId,
        name: 'Summer Sale',
        discountPercentage: 60,
        status: OfferStatus.ACTIVE,
      };

      jest.spyOn(service, 'updateOffer').mockResolvedValue(expectedResult);

      const result = await controller.update(offerId, updateDto);

      expect(result).toEqual(expectedResult);
      expect(service.updateOffer).toHaveBeenCalledWith(offerId, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete an offer', async () => {
      const offerId = 'offer-123';

      jest.spyOn(service, 'deleteOffer').mockResolvedValue(undefined);

      await controller.remove(offerId);

      expect(service.deleteOffer).toHaveBeenCalledWith(offerId);
    });
  });
});
