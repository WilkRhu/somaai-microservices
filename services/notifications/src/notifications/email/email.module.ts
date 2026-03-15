import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { SendgridService } from './services/sendgrid.service';
import { SmtpService } from './services/smtp.service';

@Module({
  providers: [EmailService, SendgridService, SmtpService],
  controllers: [EmailController],
  exports: [EmailService],
})
export class EmailModule {}
