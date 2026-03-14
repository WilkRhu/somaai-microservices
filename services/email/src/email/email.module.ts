import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { SendgridService } from './services/sendgrid.service';
import { SmtpService } from './services/smtp.service';
import { RegistrationConsumer } from './consumers/registration.consumer';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [KafkaModule],
  controllers: [EmailController],
  providers: [EmailService, SendgridService, SmtpService, RegistrationConsumer],
  exports: [EmailService],
})
export class EmailModule {}
