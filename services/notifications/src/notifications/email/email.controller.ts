import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { EmailService, StoredEmail } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';
import { SendBulkEmailDto } from './dto/send-bulk-email.dto';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  async sendEmail(@Body() dto: SendEmailDto) {
    return this.emailService.sendEmail(dto);
  }

  @Post('send-bulk')
  async sendBulkEmail(@Body() dto: SendBulkEmailDto) {
    return this.emailService.sendBulkEmail(dto);
  }

  @Get('status/:emailId')
  async getEmailStatus(@Param('emailId') emailId: string): Promise<StoredEmail> {
    return this.emailService.getEmailStatus(emailId);
  }
}
