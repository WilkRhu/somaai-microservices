import { Controller, Post, Body, Get, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OcrService } from './ocr.service';

@ApiTags('OCR')
@Controller('api/ocr')
export class OcrController {
  private logger = new Logger(OcrController.name);

  constructor(private ocrService: OcrService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  health() {
    return { status: 'ok', service: 'ocr' };
  }

  @Post('extract-base64')
  @ApiOperation({ summary: 'Extract text and data from base64 image' })
  @ApiResponse({ status: 201, description: 'Extraction completed' })
  async extractBase64(@Body() body: any) {
    try {
      this.logger.debug(`Body received:`, body);
      this.logger.debug(`Body type:`, typeof body);
      this.logger.debug(`Body keys:`, body ? Object.keys(body) : 'null');

      // Accept both 'image' and 'imageBase64' field names
      const imageData = body?.imageBase64 || body?.image;
      
      if (!body || !imageData) {
        this.logger.error('Image data is required. Body:', body);
        throw new HttpException('Image data is required', HttpStatus.BAD_REQUEST);
      }

      // Normalize the body to use imageBase64
      const normalizedBody = {
        ...body,
        imageBase64: imageData,
      };

      return await this.ocrService.extractBase64(normalizedBody);
    } catch (error) {
      this.logger.error(`Controller error:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'OCR extraction failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
