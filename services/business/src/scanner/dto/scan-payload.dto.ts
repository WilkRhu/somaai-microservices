import { IsString, IsISO8601 } from 'class-validator';

export class ScanPayloadDto {
  @IsString()
  barcode: string;

  @IsISO8601()
  timestamp: string;
}
