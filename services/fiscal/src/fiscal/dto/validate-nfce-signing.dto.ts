import { IsString, IsUUID, IsOptional } from 'class-validator';

export class ValidateNfceSigningDto {
  @IsUUID()
  nfceId: string;

  @IsString()
  certificatePath: string;

  @IsString()
  @IsOptional()
  certificatePassword?: string;
}
