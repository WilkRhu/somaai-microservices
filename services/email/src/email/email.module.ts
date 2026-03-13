import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { SendgridService } from './services/sendgrid.service';
import { SmtpService } from './services/smtp.service';

@Module({
  controllers: [EmailController],
  providers: [EmailService, SendgridService, SmtpService],
  exports: [EmailService],
})
export class EmailModule {}
