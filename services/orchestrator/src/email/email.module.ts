import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EmailClient } from './email.client';
import { EmailController } from './email.controller';

@Module({
  imports: [HttpModule],
  providers: [EmailClient],
  controllers: [EmailController],
  exports: [EmailClient],
})
export class EmailModule {}
