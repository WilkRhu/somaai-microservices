import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { MercadopagoController } from './mercadopago.controller';
import { MercadopagoService } from './mercadopago.service';
import { MercadopagoIntegration } from './entities/mercadopago-integration.entity';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([MercadopagoIntegration]), HttpModule, CommonModule],
  controllers: [MercadopagoController],
  providers: [MercadopagoService],
  exports: [MercadopagoService],
})
export class MercadopagoModule {}
