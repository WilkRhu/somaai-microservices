import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { EstablishmentsController } from './establishments.controller';
import { EstablishmentsService } from './establishments.service';
import { Establishment } from './entities/establishment.entity';
import { EstablishmentMember } from './entities/establishment-member.entity';
import { EstablishmentUser } from '../shared/entities/establishment-user.entity';
import { CommonModule } from '../common/common.module';
import { KafkaModule } from '../shared/kafka/kafka.module';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [TypeOrmModule.forFeature([Establishment, EstablishmentMember, EstablishmentUser]), HttpModule, CommonModule, KafkaModule, CustomersModule],
  controllers: [EstablishmentsController],
  providers: [EstablishmentsService],
  exports: [EstablishmentsService],
})
export class EstablishmentsModule {}
