import { Module } from '@nestjs/common';
import { SmsProvider } from './sms/sms.provider';
import { PushProvider } from './push/push.provider';

@Module({
  providers: [SmsProvider, PushProvider],
  exports: [SmsProvider, PushProvider],
})
export class ProvidersModule {}
