import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstablishmentsController } from './establishments.controller';
import { EstablishmentsService } from './establishments.service';
import { Establishment } from './entities/establishment.entity';
import { EstablishmentMember } from './entities/establishment-member.entity';
import { User } from '../shared/entities/user.entity';
import { EstablishmentUser } from '../shared/entities/establishment-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Establishment, EstablishmentMember, User, EstablishmentUser])],
  controllers: [EstablishmentsController],
  providers: [EstablishmentsService],
  exports: [EstablishmentsService],
})
export class EstablishmentsModule {}
