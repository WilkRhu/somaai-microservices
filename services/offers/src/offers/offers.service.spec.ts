import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OffersService } from './offers.service';
import { OfferEntity } from './entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { mockRepository } from '../../../test/mocks/database.mock';

describe('OffersService', () => {
  let service: OffersService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        OffersService,
        {
          provide: getRepositoryToken(OfferEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OffersService>(OffersService);
  });

  afterEach(async () => {
    await module.close();
    jest.clearAllMocks();
  });

  describe('createOffer', () => {
    it('should create an offer', async () => {
      const createDto: CreateOfferDto = {
        productId: 'prod-001',
        discountPercentage: 10,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      const expectedOffer = {
        id: 'offer-123',
        ...createDto,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(expectedOffer);
      mockRepository.save.mockResolvedValue(expectedOffer);

      const result = await service.createOffer(createDto);

      expect(result).toEqual(expectedOffer);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw error when discount is invalid', async () => {
      const createDto: CreateOfferDto = {
        productId: 'prod-001',
        discountPercentage: 150,
        validFrom: new Date(),
        validUntil: new Date(),
      };

      mockRepository.create.mockImplementation(() => {
        throw new Error('Discount must be between 0 and 100');
      });

      await expect(service.createOffer(createDto)).rejects.toThrow(
        'Discount must be between 0 and 100',
      );
    });
  });

  describe('getOffer', () => {
    it('should retrieve an offer by id', async () => {
      const offerId = 'offer-123';
      const expectedOffer = {
        id: offerId,
        productId: 'prod-001',
        discountPercentage: 10,
        isActive: true,
      };

      mockRepository.findOne.mockResolvedValue(expectedOffer);

      const result = await service.getOffer(offerId);

      expect(result).toEqual(expectedOffer);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: offerId },
      });
    });

    it('should return null when offer not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getOffer('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('listActiveOffers', () => {
    it('should list all active offers', async () => {
      const expectedOffers = [
        {
          id: 'offer-1',
          productId: 'prod-001',
          discountPercentage: 10,
          isActive: true,
        },
        {
          id: 'offer-2',
          productId: 'prod-002',
          discountPercentage: 15,
          isActive: true,
        },
      ];

      mockRepository.find.mockResolvedValue(expectedOffers);

      const result = await service.listActiveOffers();

      expect(result).toEqual(expectedOffers);
      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true }),
        }),
      );
    });
  });

  describe('updateOffer', () => {
    it('should update an offer', async () => {
      const offerId = 'offer-123';
      const updateData = { discountPercentage: 20 };

      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateOffer(offerId, updateData);

      expect(mockRepository.update).toHaveBeenCalledWith(offerId, updateData);
    });
  });

  describe('deactivateOffer', () => {
    it('should deactivate an offer', async () => {
      const offerId = 'offer-123';

      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.deactivateOffer(offerId);

      expect(mockRepository.update).toHaveBeenCalledWith(offerId, {
        isActive: false,
      });
    });
  });

  describe('getOffersByProductId', () => {
    it('should get offers by product id', async () => {
      const productId = 'prod-001';
      const expectedOffers = [
        {
          id: 'offer-1',
          productId,
          discountPercentage: 10,
          isActive: true,
        },
      ];

      mockRepository.find.mockResolvedValue(expectedOffers);

      const result = await service.getOffersByProductId(productId);

      expect(result).toEqual(expectedOffers);
      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ productId }),
        }),
      );
    });
  });
});
