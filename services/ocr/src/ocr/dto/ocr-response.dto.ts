export class OcrResponseDto {
  id: string;
  fileName: string;
  documentType: string;
  status: string;
  extractedText?: string;
  extractedData?: Record<string, any>;
  confidence?: number;
  errorMessage?: string;
  referenceId?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
