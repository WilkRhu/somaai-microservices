import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExtractResponseDto {
  @ApiProperty({
    example: 'Extracted text from image',
    description: 'Raw text extracted from image',
  })
  text!: string;

  @ApiProperty({
    example: { invoiceNumber: '123456', date: '2026-03-14' },
    description: 'Structured data extracted from image',
  })
  extractedData!: Record<string, any>;

  @ApiProperty({
    example: 0.95,
    description: 'Confidence score of extraction (0-1)',
  })
  confidence!: number;

  @ApiPropertyOptional({
    example: 'nfce',
    description: 'Document type detected',
  })
  documentType?: string;
}
