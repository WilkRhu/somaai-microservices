import { Controller, Post, Get, Body, Param, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmailClient } from './email.client';

@ApiTags('Email')
@ApiBearerAuth()
@Controller('email')
export class EmailController {
  constructor(private emailClient: EmailClient) {}

  @Post('send')
  @ApiOperation({ summary: 'Send email' })
  async sendEmail(@Body() dto: any, @Headers() headers: any) {
    return this.emailClient.sendEmail(dto, headers);
  }

  @Post('send-bulk')
  @ApiOperation({ summary: 'Send bulk email' })
  async sendBulkEmail(@Body() dto: any, @Headers() headers: any) {
    return this.emailClient.sendBulkEmail(dto, headers);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get email status' })
  async getEmailStatus(@Param('id') id: string, @Headers() headers: any) {
    return this.emailClient.getEmailStatus(id, headers);
  }
}
