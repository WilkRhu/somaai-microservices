import { IsObject, IsString } from 'class-validator';

export class ValidateWebhookDto {
  @IsString()
  signature!: string;

  @IsObject()
  data!: any;

  @IsString()
  timestamp!: string;
}
