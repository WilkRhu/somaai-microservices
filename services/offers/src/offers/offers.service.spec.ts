import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException } from '@nestjs/common';
import { OffersService } from './offers.service';
import { OfferEntity, OfferStatus } from './entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

describe('OffersService', () => {
  let service: OffersService;
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
      publishOfferCreated: jest.fn().mockResolvedValue(undefined),
      publishOfferUpdated: jest.fn().mockResolvedValue(undefined),
      publishOfferDeleted: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OffersService,
        {
          provide: getRepositoryToken(OfferEntity),
          useValue: mockRepository,
        },
        {
          provide: 'OffersProducerService',
          useValue: mockProducer,
        },
      ],
    })
      .overrideProvider('OffersProducerService')
      .useValue(mockProducer)
      .compile();

    service = module.get<OffersService>(OffersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOffer', () => {
    it('should create an offer successfully', async () => {
      const createDto: CreateOfferDto = {
        name: 'Summer Sale',
        description: '50% off on all items',
        discountPercentage: 50,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
      };

      const expectedOffer = {
        id: 'offer-123',
        ...createDto,
        status: OfferStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(expectedOffer);
      mockRepository.save.mockResolvedValue(expectedOffer);

      const result = await service.createOffer(createDto);

      expect(result).toBeDefined();
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockProducer.publishOfferCreated).toHaveBeenCalled();
    });

    it('should throw error when creation fails', async () => {
      const createDto: CreateOfferDto = {
        name: 'Summer Sale',
        description: '50% off on all items',
        discountPercentage: 50,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
      };

      mockRepository.create.mockReturnValue(createDto);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.createOffer(createDto)).rejects.toThrow(HttpException);
    });
  });

  describe('getOfferById', () => {
    it('should return an offer by id', async () => {
      const offerId = 'offer-123';
      const expectedOffer = {
        id: offerId,
        name: 'Summer Sale',
        discountPercentage: 50,
        status: OfferStatus.ACTIVE,
      };

      mockRepository.findOne.mockResolvedValue(expectedOffer);

      const result = await service.getOfferById(offerId);

      expect(result).toBeDefined();
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: offerId } });
    });

    it('should throw NOT_FOUND when offer does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getOfferById('non-existent')).rejects.toThrow(HttpException);
    });
  });

  describe('listOffers', () => {
    it('should return list of offers', async () => {
      const expectedOffers = [
        { id: 'offer-1', name: 'Sale 1', discountPercentage: 50, status: OfferStatus.ACTIVE },
        { id: 'offer-2', name: 'Sale 2', discountPercentage: 30, status: OfferStatus.ACTIVE },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(expectedOffers),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.listOffers();

      expect(result).toEqual(expectedOffers);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('offer');
    });

    it('should filter by status', async () => {
      const status = OfferStatus.ACTIVE;
      const expectedOffers = [{ id: 'offer-1', name: 'Sale 1', status }];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(expectedOffers),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.listOffers(status);

      expect(result).toEqual(expectedOffers);
      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });
  });

  describe('updateOffer', () => {
    it('should update an offer successfully', async () => {
      const offerId = 'offer-123';
      const updateDto: UpdateOfferDto = { discountPercentage: 60 };
      const existingOffer = {
        id: offerId,
        name: 'Summer Sale',
        discountPercentage: 50,
        status: OfferStatus.ACTIVE,
      };

      mockRepository.findOne.mockResolvedValue(existingOffer);
      mockRepository.save.mockResolvedValue({ ...existingOffer, ...updateDto });

      const result = await service.updateOffer(offerId, updateDto);

      expect(result).toBeDefined();
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: offerId } });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockProducer.publishOfferUpdated).toHaveBeenCalled();
    });

    it('should throw NOT_FOUND when offer does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateOffer('non-existent', {})).rejects.toThrow(HttpException);
    });
  });

  describe('deleteOffer', () => {
    it('should delete an offer successfully', async () => {
      const offerId = 'offer-123';
      const existingOffer = { id: offerId, name: 'Summer Sale', discountPercentage: 50 };

      mockRepository.findOne.mockResolvedValue(existingOffer);
      mockRepository.remove.mockResolvedValue(undefined);

      await service.deleteOffer(offerId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: offerId } });
      expect(mockRepository.remove).toHaveBeenCalledWith(existingOffer);
      expect(mockProducer.publishOfferDeleted).toHaveBeenCalled();
    });

    it('should throw NOT_FOUND when offer does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteOffer('non-existent')).rejects.toThrow(HttpException);
    });
  });
});
