import {
  Controller,
  Post,
  Body,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OcrService } from './ocr.service';

@ApiTags('OCR')
@Controller('api/monolith/ocr')
export class OcrController {
  private logger = new Logger(OcrController.name);

  constructor(private ocrService: OcrService) {}

  @Post('extract-base64')
  @ApiOperation({ summary: 'Extract text and data from base64 image' })
  async extractBase64(@Body() data: any) {
    this.logger.log(`📥 ORCHESTRATOR CONTROLLER: Received OCR request`);
    this.logger.log(`   - Document Type: ${data.documentType}`);
    this.logger.log(`   - Language: ${data.language}`);
    
    const result = await this.ocrService.extractBase64(data);
    
    this.logger.log(`📤 ORCHESTRATOR CONTROLLER: Returning OCR result`);
    this.logger.log(`   - Success: ${result.success}`);
    this.logger.log(`   - Price: ${result.data?.extractedData?.mainValue?.value}`);
    
    return result;
  }
}
