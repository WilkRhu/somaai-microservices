import { Controller, Post, Body, UseInterceptors, UploadedFile, UseGuards, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { AuthGuard } from '../common/guards/auth.guard';

@ApiTags('Upload')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('api/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  @ApiOperation({ summary: 'Upload file (multipart or base64)' })
  async upload(@UploadedFile() file: any, @Body() body: any, @Request() req: any) {
    return this.uploadService.upload(file, body);
  }
}
