import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OcrService } from './ocr.service';
import { ProcessImageDto } from './dto/process-image.dto';
import { OcrResponseDto } from './dto/ocr-response.dto';
import { Auth } from '../common/decorators/auth.decorator';

@ApiTags('OCR')
@ApiBearerAuth('access-token')
@Controller('api/ocr')
export class OcrController {
  constructor(private ocrService: OcrService) {}

  @Post('process')
  @Auth()
  @ApiOperation({ summary: 'Process image with OCR' })
  @ApiResponse({ status: 201, description: 'Image processing started', type: OcrResponseDto })
  async processImage(@Body() processImageDto: ProcessImageDto): Promise<OcrResponseDto> {
    return this.ocrService.processImage(processImageDto);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get OCR processing result' })
  @ApiResponse({ status: 200, description: 'Processing result', type: OcrResponseDto })
  async getProcessing(@Param('id') id: string): Promise<OcrResponseDto> {
    return this.ocrService.getProcessing(id);
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'List OCR processings' })
  @ApiResponse({ status: 200, description: 'Processings list', type: [OcrResponseDto] })
  async listProcessing(@Query('status') status?: string): Promise<OcrResponseDto[]> {
    return this.ocrService.listProcessing(status);
  }
}
