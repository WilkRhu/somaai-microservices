import { Module } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { OcrController } from './ocr.controller';
import { TesseractService } from './services/tesseract.service';

@Module({
  controllers: [OcrController],
  providers: [OcrService, TesseractService],
  exports: [OcrService],
})
export class OcrModule {}
