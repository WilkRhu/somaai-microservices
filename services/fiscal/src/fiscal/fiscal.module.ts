import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FiscalController } from './fiscal.controller';
import { FiscalService } from './fiscal.service';
import { NfceEntity } from './entities/nfce.entity';
import { SefazService } from './services/sefaz.service';
import { XmlSignerService } from './services/xml-signer.service';
import { FiscalProducerService } from '../kafka/fiscal.producer';

@Module({
  imports: [TypeOrmModule.forFeature([NfceEntity])],
  controllers: [FiscalController],
  providers: [FiscalService, SefazService, XmlSignerService, FiscalProducerService],
  exports: [FiscalService],
})
export class FiscalModule {}
