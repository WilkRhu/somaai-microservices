import { Module } from '@nestjs/common';
import { AuthClient } from './auth.client';
import { AuthController } from './auth.controller';

@Module({
  providers: [AuthClient],
  controllers: [AuthController],
  exports: [AuthClient],
})
export class AuthModule {}
