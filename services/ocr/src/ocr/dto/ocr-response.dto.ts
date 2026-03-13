import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OcrResponseDto {
  @ApiProperty({
    example: 'ocr-uuid-123',
    description: 'OCR processing ID',
  })
  id!: string;

  @ApiProperty({
    example: 'invoice_2026_03_12.jpg',
    description: 'File name of the image',
  })
  fileName!: string;

  @ApiProperty({
    example: 'nfce',
    description: 'Document type',
  })
  documentType!: string;

  @ApiProperty({
    example: 'COMPLETED',
    description: 'Processing status',
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
  })
  status!: string;

  @ApiPropertyOptional({
    example: 'NFC-e number: 123456, Date: 2026-03-12',
    description: 'Extracted text from image',
  })
  extractedText?: string;

  @ApiPropertyOptional({
    example: { nfceNumber: '123456', date: '2026-03-12', value: 100.00 },
    description: 'Extracted structured data',
  })
  extractedData?: Record<string, any>;

  @ApiPropertyOptional({
    example: 0.95,
    description: 'Confidence score (0-1)',
  })
  confidence?: number;

  @ApiPropertyOptional({
    example: 'Image quality too low',
    description: 'Error message if processing failed',
  })
  errorMessage?: string;

  @ApiPropertyOptional({
    example: 'sale-uuid-123',
    description: 'Reference ID (sale, invoice, etc)',
  })
  referenceId?: string;

  @ApiProperty({
    example: '2026-03-12T10:00:00Z',
    description: 'Creation date',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-03-12T10:00:00Z',
    description: 'Last update date',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    example: '2026-03-12T10:05:00Z',
    description: 'Completion date',
  })
  completedAt?: Date;
}
