import { IsString } from 'class-validator';

export class RegisterDeviceTokenDto {
  @IsString()
  token!: string;

  @IsString()
  platform!: string; // ios, android, web

  @IsString()
  deviceName!: string;
}
