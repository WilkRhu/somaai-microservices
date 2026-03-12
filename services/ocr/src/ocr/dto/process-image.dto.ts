import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProcessImageDto {
  @ApiProperty({
    example: 'invoice_2026_03_12.jpg',
    description: 'File name of the image',
  })
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @ApiProperty({
    example: 'nfce',
    description: 'Document type (nfce, receipt, invoice)',
    enum: ['nfce', 'receipt', 'invoice'],
  })
  @IsNotEmpty()
  @IsString()
  documentType: string;

  @ApiProperty({
    example: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    description: 'Base64 encoded image',
  })
  @IsNotEmpty()
  @IsString()
  imageBase64: string;

  @ApiPropertyOptional({
    example: 'sale-uuid-123',
    description: 'Reference ID (sale, invoice, etc) - optional',
  })
  @IsOptional()
  @IsString()
  referenceId?: string;
}
