import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { EstablishmentsService } from './establishments.service';
import { EstablishmentsController } from './establishments.controller';
import { Establishment } from './entities/establishment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Establishment]), CommonModule],
  controllers: [EstablishmentsController],
  providers: [EstablishmentsService],
  exports: [EstablishmentsService],
})
export class EstablishmentsModule {}
