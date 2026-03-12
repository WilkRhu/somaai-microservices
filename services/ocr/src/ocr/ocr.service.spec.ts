import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { OcrProcessing } from './entities/ocr-processing.entity';
import { ProcessImageDto } from './dto/process-image.dto';

describe('OcrService', () => {
  let service: OcrService;
  let mockRepository: any;
  let mockTesseractService: any;
  let mockProducer: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    mockTesseractService = {
      extractText: jest.fn().mockResolvedValue({
        text: 'Extracted text',
        confidence: 0.95,
      }),
      extractStructuredData: jest.fn().mockResolvedValue({
        field1: 'value1',
        field2: 'value2',
      }),
    };

    mockProducer = {
      publishProcessingCompleted: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OcrService,
        {
          provide: getRepositoryToken(OcrProcessing),
          useValue: mockRepository,
        },
        {
          provide: 'TesseractService',
          useValue: mockTesseractService,
        },
        {
          provide: 'OcrProducerService',
          useValue: mockProducer,
        },
      ],
    })
      .overrideProvider('TesseractService')
      .useValue(mockTesseractService)
      .overrideProvider('OcrProducerService')
      .useValue(mockProducer)
      .compile();

    service = module.get<OcrService>(OcrService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processImage', () => {
    it('should process an image successfully', async () => {
      const processDto: ProcessImageDto = {
        imageBase64: Buffer.from('test image data').toString('base64'),
        fileName: 'test.jpg',
        documentType: 'invoice',
        referenceId: 'ref-123',
      };

      const expectedProcessing = {
        id: 'processing-123',
        ...processDto,
        status: 'processing',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(expectedProcessing);
      mockRepository.save.mockResolvedValue(expectedProcessing);

      const result = await service.processImage(processDto);

      expect(result).toBeDefined();
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw error when imageBase64 is missing', async () => {
      const processDto: ProcessImageDto = {
        imageBase64: '',
        fileName: 'test.jpg',
        documentType: 'invoice',
        referenceId: 'ref-123',
      };

      await expect(service.processImage(processDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getProcessing', () => {
    it('should return processing by id', async () => {
      const processingId = 'processing-123';
      const expectedProcessing = {
        id: processingId,
        fileName: 'test.jpg',
        documentType: 'invoice',
        status: 'completed',
        extractedText: 'Extracted text',
      };

      mockRepository.findOne.mockResolvedValue(expectedProcessing);

      const result = await service.getProcessing(processingId);

      expect(result).toBeDefined();
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: processingId } });
    });

    it('should throw error when processing not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getProcessing('non-existent')).rejects.toThrow(BadRequestException);
    });
  });

  describe('listProcessing', () => {
    it('should return list of processings', async () => {
      const expectedProcessings = [
        { id: 'processing-1', fileName: 'test1.jpg', status: 'completed' },
        { id: 'processing-2', fileName: 'test2.jpg', status: 'completed' },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(expectedProcessings),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.listProcessing();

      expect(result).toEqual(expectedProcessings);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('ocr');
    });

    it('should filter by status', async () => {
      const status = 'completed';
      const expectedProcessings = [{ id: 'processing-1', fileName: 'test1.jpg', status }];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(expectedProcessings),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.listProcessing(status);

      expect(result).toEqual(expectedProcessings);
      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });
  });
});
