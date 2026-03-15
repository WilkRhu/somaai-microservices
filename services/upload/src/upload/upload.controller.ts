import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Body,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UploadService, UploadRecord } from './upload.service';
import { UploadFileDto } from './dto/upload-file.dto';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024, fieldSize: 10 * 1024 * 1024 } }))
  @ApiOperation({ summary: 'Upload a file (multipart or base64)' })
  async uploadFile(
    @UploadedFile() file: any,
    @Body() dto: UploadFileDto,
  ): Promise<{ id: string; url: string; fileName: string }> {
    return this.uploadService.uploadFile(file, dto.base64, dto.folder, dto.fileName);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get upload information' })
  async getUploadInfo(@Param('id') id: string): Promise<UploadRecord> {
    return this.uploadService.getUploadInfo(id);
  }
}
