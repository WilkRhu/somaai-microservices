import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthValidationService } from './services/auth-validation.service';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

@Module({
  imports: [
    HttpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production',
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthValidationService, AuthGuard, RoleGuard],
  exports: [AuthValidationService, AuthGuard, RoleGuard, JwtModule],
})
export class CommonModule {}
