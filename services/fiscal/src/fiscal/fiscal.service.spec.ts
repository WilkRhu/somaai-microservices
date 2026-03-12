import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException } from '@nestjs/common';
import { FiscalService } from './fiscal.service';
import { NfceEntity, NfceStatus } from './entities/nfce.entity';
import { GenerateNfceDto } from './dto/generate-nfce.dto';

describe('FiscalService', () => {
  let service: FiscalService;
  let mockRepository: any;
  let mockSefazService: any;
  let mockXmlSignerService: any;
  let mockProducer: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    mockSefazService = {
      authorizeNfce: jest.fn().mockResolvedValue({
        protocolNumber: 'PROTO-123',
        authorizationCode: 'AUTH-123',
      }),
      cancelNfce: jest.fn().mockResolvedValue(undefined),
    };

    mockXmlSignerService = {
      signXml: jest.fn().mockResolvedValue('<signed-xml></signed-xml>'),
    };

    mockProducer = {
      publishNfceIssued: jest.fn().mockResolvedValue(undefined),
      publishNfceFailed: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FiscalService,
        {
          provide: getRepositoryToken(NfceEntity),
          useValue: mockRepository,
        },
        {
          provide: 'SefazService',
          useValue: mockSefazService,
        },
        {
          provide: 'XmlSignerService',
          useValue: mockXmlSignerService,
        },
        {
          provide: 'FiscalProducerService',
          useValue: mockProducer,
        },
      ],
    })
      .overrideProvider('SefazService')
      .useValue(mockSefazService)
      .overrideProvider('XmlSignerService')
      .useValue(mockXmlSignerService)
      .overrideProvider('FiscalProducerService')
      .useValue(mockProducer)
      .compile();

    service = module.get<FiscalService>(FiscalService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateNfce', () => {
    it('should generate and authorize NFC-e successfully', async () => {
      const generateDto: GenerateNfceDto = {
        establishmentId: 'est-123',
        number: 1,
        series: 1,
        totalValue: 100.0,
      };

      const expectedNfce = {
        id: 'nfce-123',
        ...generateDto,
        status: NfceStatus.AUTHORIZED,
        protocolNumber: 'PROTO-123',
        authorizationCode: 'AUTH-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(expectedNfce);
      mockRepository.save.mockResolvedValue(expectedNfce);

      const result = await service.generateNfce(generateDto);

      expect(result).toBeDefined();
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockXmlSignerService.signXml).toHaveBeenCalled();
      expect(mockSefazService.authorizeNfce).toHaveBeenCalled();
      expect(mockProducer.publishNfceIssued).toHaveBeenCalled();
    });

    it('should throw error when generation fails', async () => {
      const generateDto: GenerateNfceDto = {
        establishmentId: 'est-123',
        number: 1,
        series: 1,
        totalValue: 100.0,
      };

      mockRepository.create.mockReturnValue(generateDto);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.generateNfce(generateDto)).rejects.toThrow(HttpException);
      expect(mockProducer.publishNfceFailed).toHaveBeenCalled();
    });
  });

  describe('getNfceById', () => {
    it('should return an NFC-e by id', async () => {
      const nfceId = 'nfce-123';
      const expectedNfce = {
        id: nfceId,
        establishmentId: 'est-123',
        number: 1,
        status: NfceStatus.AUTHORIZED,
      };

      mockRepository.findOne.mockResolvedValue(expectedNfce);

      const result = await service.getNfceById(nfceId);

      expect(result).toBeDefined();
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: nfceId } });
    });

    it('should throw NOT_FOUND when NFC-e does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getNfceById('non-existent')).rejects.toThrow(HttpException);
    });
  });

  describe('listNfces', () => {
    it('should return list of NFC-es by establishment', async () => {
      const establishmentId = 'est-123';
      const expectedNfces = [
        { id: 'nfce-1', establishmentId, number: 1, status: NfceStatus.AUTHORIZED },
        { id: 'nfce-2', establishmentId, number: 2, status: NfceStatus.AUTHORIZED },
      ];

      mockRepository.find.mockResolvedValue(expectedNfces);

      const result = await service.listNfces(establishmentId);

      expect(result).toEqual(expectedNfces);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { establishmentId },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('cancelNfce', () => {
    it('should cancel an authorized NFC-e', async () => {
      const nfceId = 'nfce-123';
      const justification = 'Cancelamento por erro';
      const existingNfce = {
        id: nfceId,
        establishmentId: 'est-123',
        status: NfceStatus.AUTHORIZED,
        protocolNumber: 'PROTO-123',
      };

      mockRepository.findOne.mockResolvedValue(existingNfce);
      mockRepository.save.mockResolvedValue({ ...existingNfce, status: NfceStatus.CANCELLED });

      const result = await service.cancelNfce(nfceId, justification);

      expect(result).toBeDefined();
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: nfceId } });
      expect(mockSefazService.cancelNfce).toHaveBeenCalledWith('PROTO-123', justification);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw error when trying to cancel non-authorized NFC-e', async () => {
      const nfceId = 'nfce-123';
      const existingNfce = {
        id: nfceId,
        status: NfceStatus.PENDING,
      };

      mockRepository.findOne.mockResolvedValue(existingNfce);

      await expect(service.cancelNfce(nfceId, 'reason')).rejects.toThrow(HttpException);
    });
  });

  describe('signNfceXml', () => {
    it('should sign NFC-e XML successfully', async () => {
      const nfceId = 'nfce-123';
      const certificatePath = '/path/to/cert.pfx';
      const existingNfce = {
        id: nfceId,
        establishmentId: 'est-123',
        status: NfceStatus.PENDING,
        xmlContent: '<xml></xml>',
      };

      mockRepository.findOne.mockResolvedValue(existingNfce);
      mockRepository.save.mockResolvedValue({ ...existingNfce, status: NfceStatus.PROCESSING, xmlContent: '<signed-xml></signed-xml>' });

      const result = await service.signNfceXml(nfceId, certificatePath);

      expect(result).toBeDefined();
      expect(mockXmlSignerService.signXml).toHaveBeenCalledWith('<xml></xml>', certificatePath);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw error when trying to sign non-pending NFC-e', async () => {
      const nfceId = 'nfce-123';
      const existingNfce = {
        id: nfceId,
        status: NfceStatus.AUTHORIZED,
      };

      mockRepository.findOne.mockResolvedValue(existingNfce);

      await expect(service.signNfceXml(nfceId, '/path/to/cert')).rejects.toThrow(HttpException);
    });

    it('should throw error when signing fails', async () => {
      const nfceId = 'nfce-123';
      const existingNfce = {
        id: nfceId,
        status: NfceStatus.PENDING,
        xmlContent: '<xml></xml>',
      };

      mockRepository.findOne.mockResolvedValue(existingNfce);
      mockXmlSignerService.signXml.mockRejectedValue(new Error('Signing failed'));

      await expect(service.signNfceXml(nfceId, '/path/to/cert')).rejects.toThrow(HttpException);
    });
  });

  describe('authorizeNfce', () => {
    it('should authorize a processing NFC-e', async () => {
      const nfceId = 'nfce-123';
      const existingNfce = {
        id: nfceId,
        establishmentId: 'est-123',
        number: 1,
        series: 1,
        totalValue: 100.0,
        status: NfceStatus.PROCESSING,
        xmlContent: '<signed-xml></signed-xml>',
      };

      mockRepository.findOne.mockResolvedValue(existingNfce);
      mockRepository.save.mockResolvedValue({
        ...existingNfce,
        status: NfceStatus.AUTHORIZED,
        protocolNumber: 'PROTO-123',
        authorizationCode: 'AUTH-123',
      });

      const result = await service.authorizeNfce(nfceId);

      expect(result).toBeDefined();
      expect(mockSefazService.authorizeNfce).toHaveBeenCalledWith('<signed-xml></signed-xml>');
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockProducer.publishNfceIssued).toHaveBeenCalled();
    });

    it('should throw error when trying to authorize non-processing NFC-e', async () => {
      const nfceId = 'nfce-123';
      const existingNfce = {
        id: nfceId,
        status: NfceStatus.PENDING,
      };

      mockRepository.findOne.mockResolvedValue(existingNfce);

      await expect(service.authorizeNfce(nfceId)).rejects.toThrow(HttpException);
    });

    it('should handle authorization failure', async () => {
      const nfceId = 'nfce-123';
      const existingNfce = {
        id: nfceId,
        establishmentId: 'est-123',
        number: 1,
        series: 1,
        status: NfceStatus.PROCESSING,
        xmlContent: '<signed-xml></signed-xml>',
      };

      mockRepository.findOne.mockResolvedValue(existingNfce);
      mockSefazService.authorizeNfce.mockRejectedValue(new Error('Authorization failed'));
      mockRepository.save.mockResolvedValue({ ...existingNfce, status: NfceStatus.FAILED });

      await expect(service.authorizeNfce(nfceId)).rejects.toThrow(HttpException);
      expect(mockProducer.publishNfceFailed).toHaveBeenCalled();
    });
  });
});
