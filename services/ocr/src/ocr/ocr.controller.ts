import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { ProcessImageDto } from './dto/process-image.dto';
import { OcrResponseDto } from './dto/ocr-response.dto';

@Controller('api/ocr')
export class OcrController {
  constructor(private ocrService: OcrService) {}

  @Post('process')
  async processImage(@Body() processImageDto: ProcessImageDto): Promise<OcrResponseDto> {
    return this.ocrService.processImage(processImageDto);
  }

  @Get(':id')
  async getProcessing(@Param('id') id: string): Promise<OcrResponseDto> {
    return this.ocrService.getProcessing(id);
  }

  @Get()
  async listProcessing(@Query('status') status?: string): Promise<OcrResponseDto[]> {
    return this.ocrService.listProcessing(status);
  }
}
