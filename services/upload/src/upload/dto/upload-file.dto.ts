import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File to upload',
  })
  file: Express.Multer.File;

  @ApiProperty({
    example: 'documents',
    description: 'Folder path in storage',
  })
  @IsString()
  @IsOptional()
  folder?: string;

  @ApiProperty({
    example: 'my-file',
    description: 'Custom file name (without extension)',
  })
  @IsString()
  @IsOptional()
  fileName?: string;
}
