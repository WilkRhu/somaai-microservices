import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OcrService } from './ocr.service';
import { OcrController } from './ocr.controller';
import { OcrProcessing } from './entities/ocr-processing.entity';
import { TesseractService } from './services/tesseract.service';
import { OcrProducerService } from '../kafka/ocr.producer';

@Module({
  imports: [TypeOrmModule.forFeature([OcrProcessing])],
  controllers: [OcrController],
  providers: [OcrService, TesseractService, OcrProducerService],
  exports: [OcrService],
})
export class OcrModule {}
