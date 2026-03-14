import { Controller, Post, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OcrService } from './ocr.service';

@ApiTags('OCR')
@ApiBearerAuth('access-token')
@Controller('api/monolith/ocr')
export class OcrController {
  constructor(private ocrService: OcrService) {}

  @Post('extract-base64')
  @ApiOperation({ summary: 'Extract text and data from base64 image' })
  @ApiResponse({ status: 201, description: 'Extraction completed' })
  async extractBase64(
    @Body() data: any,
    @Headers('authorization') authHeader: string,
  ) {
    const token = authHeader?.replace('Bearer ', '');
    return this.ocrService.extractBase64(data, token);
  }
}
