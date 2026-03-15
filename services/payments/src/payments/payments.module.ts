import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentEntity } from './entities/payment.entity';
import { MercadopagoService } from './services/mercadopago.service';
import { PaymentsProducerService } from '../kafka/payments.producer';
import { JwtAuthGuard } from '../common/guards/jwt.guard';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity])],
  controllers: [PaymentsController],
  providers: [PaymentsService, MercadopagoService, PaymentsProducerService, JwtAuthGuard],
  exports: [PaymentsService],
})
export class PaymentsModule {}
