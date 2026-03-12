import { IsString, IsUUID, MinLength } from 'class-validator';

export class ValidateNfceCancellationDto {
  @IsUUID()
  nfceId: string;

  @IsString()
  @MinLength(15)
  justification: string;

  @IsString()
  cancelledBy: string;
}
