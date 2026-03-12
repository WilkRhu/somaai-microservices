import { IsString, IsOptional } from 'class-validator';

export class ProcessImageDto {
  @IsString()
  fileName: string;

  @IsString()
  documentType: string; // nfce, receipt, invoice

  @IsString()
  imageBase64: string; // Base64 encoded image

  @IsOptional()
  @IsString()
  referenceId?: string; // ID da venda, nota fiscal, etc
}
