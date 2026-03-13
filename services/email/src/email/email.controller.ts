import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';
import { SendBulkEmailDto } from './dto/send-bulk-email.dto';
import { EmailStatus } from './enums/email-status.enum';

@ApiTags('Email')
@ApiBearerAuth()
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send email' })
  async sendEmail(@Body() dto: SendEmailDto): Promise<{ id: string; to: string; subject: string; status: EmailStatus; sentAt?: Date }> {
    return this.emailService.sendEmail(dto);
  }

  @Post('send-bulk')
  @ApiOperation({ summary: 'Send bulk email' })
  async sendBulkEmail(@Body() dto: SendBulkEmailDto): Promise<{ recipientCount: number; status: string; createdAt: Date }> {
    return this.emailService.sendBulkEmail(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get email status' })
  async getEmailStatus(@Param('id') id: string): Promise<{ id: string; to: string; subject: string; status: EmailStatus; sentAt?: Date; deliveredAt?: Date; opens: number; clicks: number }> {
    return this.emailService.getEmailStatus(id);
  }
}
