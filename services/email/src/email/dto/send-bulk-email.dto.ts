import { IsEmail, IsString, IsArray, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendBulkEmailDto {
  @ApiProperty({
    example: ['customer1@example.com', 'customer2@example.com'],
    description: 'Array of recipient email addresses',
  })
  @IsArray()
  @IsEmail({}, { each: true })
  recipients!: string[];

  @ApiProperty({
    example: 'Special Offer',
    description: 'Email subject',
  })
  @IsString()
  subject!: string;

  @ApiProperty({
    example: 'promotional',
    description: 'Email template name',
  })
  @IsString()
  template!: string;

  @ApiProperty({
    example: { discount: '20%', validUntil: '2026-03-31' },
    description: 'Template variables',
  })
  @IsObject()
  data!: Record<string, any>;
}
