import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as express from 'express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { KafkaModule } from './kafka/kafka.module';
import { BusinessModule } from './business/business.module';
import { PaymentsModule } from './payments/payments.module';
import { DeliveryModule } from './delivery/delivery.module';
import { FiscalModule } from './fiscal/fiscal.module';
import { OcrModule } from './ocr/ocr.module';
import { MonolithModule } from './monolith/monolith.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    KafkaModule,
    AuthModule,
    OrdersModule,
    BusinessModule,
    PaymentsModule,
    DeliveryModule,
    FiscalModule,
    OcrModule,
    MonolithModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(express.json({ limit: '50mb' }))
      .forRoutes('*');
  }
}
