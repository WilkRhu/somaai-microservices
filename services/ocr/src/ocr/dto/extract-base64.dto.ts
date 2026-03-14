import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExtractBase64Dto {
  @ApiProperty({
    example: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    description: 'Base64 encoded image',
  })
  imageBase64!: string;

  @ApiPropertyOptional({
    example: 'receipt',
    description: 'Document type (nfce, receipt, invoice) - optional, defaults to receipt',
  })
  documentType?: string;

  @ApiPropertyOptional({
    example: 'por',
    description: 'Language for OCR (por, eng, etc) - optional',
  })
  language?: string;
}
