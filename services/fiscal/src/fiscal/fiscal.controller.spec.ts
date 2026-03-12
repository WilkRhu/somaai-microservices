import { Test, TestingModule } from '@nestjs/testing';
import { FiscalController } from './fiscal.controller';
import { FiscalService } from './fiscal.service';
import { NfceStatus } from './entities/nfce.entity';
import { GenerateNfceDto } from './dto/generate-nfce.dto';

describe('FiscalController', () => {
  let controller: FiscalController;
  let service: FiscalService;

  beforeEach(async () => {
    const mockService = {
      generateNfce: jest.fn(),
      getNfceById: jest.fn(),
      listNfces: jest.fn(),
      cancelNfce: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FiscalController],
      providers: [
        {
          provide: FiscalService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<FiscalController>(FiscalController);
    service = module.get<FiscalService>(FiscalService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateNfce', () => {
    it('should generate an NFC-e', async () => {
      const generateDto: GenerateNfceDto = {
        establishmentId: 'est-123',
        number: 1,
        series: 1,
        totalValue: 100.0,
      };

      const expectedResult = {
        id: 'nfce-123',
        ...generateDto,
        status: NfceStatus.AUTHORIZED,
        protocolNumber: 'PROTO-123',
        authorizationCode: 'AUTH-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'generateNfce').mockResolvedValue(expectedResult);

      const result = await controller.generateNfce(generateDto);

      expect(result).toEqual(expectedResult);
      expect(service.generateNfce).toHaveBeenCalledWith(generateDto);
    });
  });

  describe('getNfce', () => {
    it('should return an NFC-e by id', async () => {
      const nfceId = 'nfce-123';
      const expectedResult = {
        id: nfceId,
        establishmentId: 'est-123',
        number: 1,
        status: NfceStatus.AUTHORIZED,
      };

      jest.spyOn(service, 'getNfceById').mockResolvedValue(expectedResult);

      const result = await controller.getNfce(nfceId);

      expect(result).toEqual(expectedResult);
      expect(service.getNfceById).toHaveBeenCalledWith(nfceId);
    });
  });

  describe('listNfces', () => {
    it('should return list of NFC-es', async () => {
      const establishmentId = 'est-123';
      const expectedResult = [
        { id: 'nfce-1', establishmentId, number: 1, status: NfceStatus.AUTHORIZED },
        { id: 'nfce-2', establishmentId, number: 2, status: NfceStatus.AUTHORIZED },
      ];

      jest.spyOn(service, 'listNfces').mockResolvedValue(expectedResult);

      const result = await controller.listNfces(establishmentId);

      expect(result).toEqual(expectedResult);
      expect(service.listNfces).toHaveBeenCalledWith(establishmentId);
    });
  });

  describe('cancelNfce', () => {
    it('should cancel an NFC-e', async () => {
      const nfceId = 'nfce-123';
      const cancelDto = { justification: 'Cancelamento por erro' };
      const expectedResult = {
        id: nfceId,
        establishmentId: 'est-123',
        status: NfceStatus.CANCELLED,
      };

      jest.spyOn(service, 'cancelNfce').mockResolvedValue(expectedResult);

      const result = await controller.cancelNfce(nfceId, cancelDto);

      expect(result).toEqual(expectedResult);
      expect(service.cancelNfce).toHaveBeenCalledWith(nfceId, cancelDto.justification);
    });
  });
});
