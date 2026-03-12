import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OcrService } from './ocr.service';

@ApiTags('OCR')
@Controller('api/ocr')
export class OcrController {
  constructor(private ocrService: OcrService) {}

  @Post('process')
  @ApiOperation({ summary: 'Process image with OCR' })
  async processImage(@Body() data: any) {
    return this.ocrService.processImage(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get OCR result' })
  async getOcrResult(@Param('id') id: string) {
    return this.ocrService.getOcrResult(id);
  }

  @Get()
  @ApiOperation({ summary: 'List OCR results' })
  async listOcrResults(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.ocrService.listOcrResults(skip, take);
  }
}
