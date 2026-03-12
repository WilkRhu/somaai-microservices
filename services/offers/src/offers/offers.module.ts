import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { OfferEntity } from './entities/offer.entity';
import { OffersProducerService } from '../kafka/offers.producer';

@Module({
  imports: [TypeOrmModule.forFeature([OfferEntity])],
  controllers: [OffersController],
  providers: [OffersService, OffersProducerService],
})
export class OffersModule {}
