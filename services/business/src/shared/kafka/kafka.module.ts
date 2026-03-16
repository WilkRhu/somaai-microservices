import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Establishment } from '../../establishments/entities/establishment.entity';
import { User } from '../../users/entities/user.entity';
import { EstablishmentUser } from '../entities/establishment-user.entity';
import { KafkaService } from './kafka.service';
import { KafkaProducerService } from './kafka-producer.service';
import { BusinessConsumer } from './business.consumer';
import { UserService } from '../services/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([Establishment, User, EstablishmentUser])],
  providers: [KafkaService, KafkaProducerService, BusinessConsumer, UserService],
  exports: [KafkaService, KafkaProducerService, UserService],
})
export class KafkaModule {}
