import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Establishment } from '../../establishments/entities/establishment.entity';
import { User } from '../entities/user.entity';
import { EstablishmentUser } from '../entities/establishment-user.entity';
import { KafkaService } from './kafka.service';
import { BusinessConsumer } from './business.consumer';
import { UserService } from '../services/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([Establishment, User, EstablishmentUser])],
  providers: [KafkaService, BusinessConsumer, UserService],
  exports: [KafkaService, UserService],
})
export class KafkaModule {}
