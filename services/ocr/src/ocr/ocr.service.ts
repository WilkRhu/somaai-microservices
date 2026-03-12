import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { OcrProcessing } from './entities/ocr-processing.entity';
import { ProcessImageDto } from './dto/process-image.dto';
import { OcrResponseDto } from './dto/ocr-response.dto';
import { TesseractService } from './services/tesseract.service';
import { OcrProducerService } from '../kafka/ocr.producer';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  constructor(
    @InjectRepository(OcrProcessing)
    private ocrRepository: Repository<OcrProcessing>,
    private tesseractService: TesseractService,
    private ocrProducer: OcrProducerService,
  ) {}

  async processImage(processImageDto: ProcessImageDto): Promise<OcrResponseDto> {
    try {
      // Validate input
      if (!processImageDto.imageBase64) {
        throw new BadRequestException('Image data is required');
      }

      // Convert base64 to buffer
      const imageBuffer = Buffer.from(processImageDto.imageBase64, 'base64');

      // Create processing record
      const processing = this.ocrRepository.create({
        id: uuidv4(),
        fileName: processImageDto.fileName,
        documentType: processImageDto.documentType,
        imageData: imageBuffer,
        status: 'processing',
        referenceId: processImageDto.referenceId,
      });

      await this.ocrRepository.save(processing);

      // Process image asynchronously
      this.processImageAsync(processing.id, imageBuffer, processImageDto.documentType);

      return this.mapToResponse(processing);
    } catch (error) {
      this.logger.error(`Error processing image: ${error.message}`);
      throw error;
    }
  }

  private async processImageAsync(
    processingId: string,
    imageBuffer: Buffer,
    documentType: string,
  ): Promise<void> {
    try {
      const language = process.env.OCR_LANGUAGE || 'por';
      const confidenceThreshold = parseFloat(process.env.OCR_CONFIDENCE_THRESHOLD || '0.5');

      // Extract text
      const { text, confidence } = await this.tesseractService.extractText(
        imageBuffer,
        language,
      );

      // Extract structured data
      const extractedData = await this.tesseractService.extractStructuredData(
        imageBuffer,
        documentType,
        language,
      );

      // Update processing record
      const processing = await this.ocrRepository.findOne({
        where: { id: processingId },
      });

      if (processing) {
        processing.status = confidence >= confidenceThreshold ? 'completed' : 'completed';
        processing.extractedText = text;
        processing.extractedData = extractedData;
        processing.confidence = confidence;
        processing.completedAt = new Date();

        await this.ocrRepository.save(processing);

        // Publish event
        await this.ocrProducer.publishProcessingCompleted({
          processingId: processing.id,
          fileName: processing.fileName,
          documentType: processing.documentType,
          status: processing.status,
          extractedText: processing.extractedText,
          extractedData: processing.extractedData,
          confidence: processing.confidence,
          referenceId: processing.referenceId,
          completedAt: processing.completedAt,
        });

        this.logger.log(`OCR processing completed for ${processingId}`);
      }
    } catch (error) {
      this.logger.error(`Error in async processing: ${error.message}`);

      // Update with error
      const processing = await this.ocrRepository.findOne({
        where: { id: processingId },
      });

      if (processing) {
        processing.status = 'failed';
        processing.errorMessage = error.message;
        processing.completedAt = new Date();
        await this.ocrRepository.save(processing);
      }
    }
  }

  async getProcessing(id: string): Promise<OcrResponseDto> {
    const processing = await this.ocrRepository.findOne({
      where: { id },
    });

    if (!processing) {
      throw new BadRequestException('Processing not found');
    }

    return this.mapToResponse(processing);
  }

  async listProcessing(status?: string): Promise<OcrResponseDto[]> {
    const query = this.ocrRepository.createQueryBuilder('ocr');

    if (status) {
      query.where('ocr.status = :status', { status });
    }

    const processings = await query.orderBy('ocr.createdAt', 'DESC').take(100).getMany();

    return processings.map((p) => this.mapToResponse(p));
  }

  private mapToResponse(processing: OcrProcessing): OcrResponseDto {
    return {
      id: processing.id,
      fileName: processing.fileName,
      documentType: processing.documentType,
      status: processing.status,
      extractedText: processing.extractedText,
      extractedData: processing.extractedData,
      confidence: processing.confidence,
      errorMessage: processing.errorMessage,
      referenceId: processing.referenceId,
      createdAt: processing.createdAt,
      updatedAt: processing.updatedAt,
      completedAt: processing.completedAt,
    };
  }
}
