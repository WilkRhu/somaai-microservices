import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { OcrModule } from '../../src/ocr/ocr.module';
import { ProcessImageDto } from '../../src/ocr/dto/process-image.dto';

describe('OCR Integration Tests', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [OcrModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/ocr/process', () => {
    it('should process an image successfully', async () => {
      const imageBase64 = Buffer.from('test image data').toString('base64');
      const processDto: ProcessImageDto = {
        imageBase64,
        fileName: 'test.jpg',
        documentType: 'invoice',
        referenceId: 'ref-123',
      };

      const response = await request(app.getHttpServer())
        .post('/api/ocr/process')
        .set('Authorization', 'Bearer test-token')
        .send(processDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.fileName).toBe(processDto.fileName);
      expect(response.body.documentType).toBe(processDto.documentType);
      expect(response.body.status).toBe('processing');
    });

    it('should reject without image data', async () => {
      const processDto = {
        imageBase64: '',
        fileName: 'test.jpg',
        documentType: 'invoice',
        referenceId: 'ref-123',
      };

      await request(app.getHttpServer())
        .post('/api/ocr/process')
        .set('Authorization', 'Bearer test-token')
        .send(processDto)
        .expect(400);
    });

    it('should reject without authentication', async () => {
      const imageBase64 = Buffer.from('test image data').toString('base64');
      const processDto: ProcessImageDto = {
        imageBase64,
        fileName: 'test.jpg',
        documentType: 'invoice',
        referenceId: 'ref-123',
      };

      await request(app.getHttpServer())
        .post('/api/ocr/process')
        .send(processDto)
        .expect(401);
    });
  });

  describe('GET /api/ocr/:id', () => {
    it('should return processing by id', async () => {
      const imageBase64 = Buffer.from('test image data').toString('base64');
      const processDto: ProcessImageDto = {
        imageBase64,
        fileName: 'test.jpg',
        documentType: 'invoice',
        referenceId: 'ref-123',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/ocr/process')
        .set('Authorization', 'Bearer test-token')
        .send(processDto)
        .expect(201);

      const processingId = createResponse.body.id;

      const getResponse = await request(app.getHttpServer())
        .get(`/api/ocr/${processingId}`)
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(getResponse.body.id).toBe(processingId);
      expect(getResponse.body.fileName).toBe(processDto.fileName);
    });

    it('should return 404 for non-existent processing', async () => {
      await request(app.getHttpServer())
        .get('/api/ocr/non-existent-id')
        .set('Authorization', 'Bearer test-token')
        .expect(404);
    });
  });

  describe('GET /api/ocr', () => {
    it('should list all processings', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/ocr')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/ocr?status=completed')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
