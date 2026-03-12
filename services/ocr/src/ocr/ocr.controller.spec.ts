import { Test, TestingModule } from '@nestjs/testing';
import { OcrController } from './ocr.controller';
import { OcrService } from './ocr.service';
import { ProcessImageDto } from './dto/process-image.dto';

describe('OcrController', () => {
  let controller: OcrController;
  let service: OcrService;

  beforeEach(async () => {
    const mockService = {
      processImage: jest.fn(),
      getProcessing: jest.fn(),
      listProcessing: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OcrController],
      providers: [
        {
          provide: OcrService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<OcrController>(OcrController);
    service = module.get<OcrService>(OcrService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processImage', () => {
    it('should process an image', async () => {
      const processDto: ProcessImageDto = {
        imageBase64: Buffer.from('test image data').toString('base64'),
        fileName: 'test.jpg',
        documentType: 'invoice',
        referenceId: 'ref-123',
      };

      const expectedResult = {
        id: 'processing-123',
        ...processDto,
        status: 'processing',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'processImage').mockResolvedValue(expectedResult);

      const result = await controller.processImage(processDto);

      expect(result).toEqual(expectedResult);
      expect(service.processImage).toHaveBeenCalledWith(processDto);
    });
  });

  describe('getProcessing', () => {
    it('should return processing by id', async () => {
      const processingId = 'processing-123';
      const expectedResult = {
        id: processingId,
        fileName: 'test.jpg',
        documentType: 'invoice',
        status: 'completed',
        extractedText: 'Extracted text',
      };

      jest.spyOn(service, 'getProcessing').mockResolvedValue(expectedResult);

      const result = await controller.getProcessing(processingId);

      expect(result).toEqual(expectedResult);
      expect(service.getProcessing).toHaveBeenCalledWith(processingId);
    });
  });

  describe('listProcessing', () => {
    it('should return list of processings', async () => {
      const expectedResult = [
        { id: 'processing-1', fileName: 'test1.jpg', status: 'completed' },
        { id: 'processing-2', fileName: 'test2.jpg', status: 'completed' },
      ];

      jest.spyOn(service, 'listProcessing').mockResolvedValue(expectedResult);

      const result = await controller.listProcessing();

      expect(result).toEqual(expectedResult);
      expect(service.listProcessing).toHaveBeenCalled();
    });

    it('should filter by status', async () => {
      const status = 'completed';
      const expectedResult = [{ id: 'processing-1', fileName: 'test1.jpg', status }];

      jest.spyOn(service, 'listProcessing').mockResolvedValue(expectedResult);

      const result = await controller.listProcessing(status);

      expect(result).toEqual(expectedResult);
      expect(service.listProcessing).toHaveBeenCalledWith(status);
    });
  });
});
