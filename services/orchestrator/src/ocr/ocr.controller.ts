import {
  Controller,
  Post,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OcrService } from './ocr.service';

@ApiTags('OCR')
@Controller('api/monolith/ocr')
export class OcrController {
  constructor(private ocrService: OcrService) {}

  @Post('extract-base64')
  @ApiOperation({ summary: 'Extract text and data from base64 image' })
  async extractBase64(@Body() data: any) {
    return this.ocrService.extractBase64(data);
  }
}
