import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NfceEntity, NfceStatus } from './entities/nfce.entity';
import { GenerateNfceDto } from './dto/generate-nfce.dto';
import { NfceResponseDto } from './dto/nfce-response.dto';
import { SefazService } from './services/sefaz.service';
import { XmlSignerService } from './services/xml-signer.service';
import { FiscalProducerService } from '../kafka/fiscal.producer';

@Injectable()
export class FiscalService {
  constructor(
    @InjectRepository(NfceEntity)
    private nfceRepository: Repository<NfceEntity>,
    private sefazService: SefazService,
    private xmlSignerService: XmlSignerService,
    private fiscalProducer: FiscalProducerService,
  ) {}

  /**
   * Generate and authorize NFC-e
   */
  async generateNfce(dto: GenerateNfceDto): Promise<NfceResponseDto> {
    try {
      // Create NFC-e entity
      const nfce = this.nfceRepository.create({
        establishmentId: dto.establishmentId,
        number: dto.number,
        series: dto.series,
        totalValue: dto.totalValue,
        xmlContent: this.buildXmlContent(dto),
        status: NfceStatus.PENDING,
      });

      await this.nfceRepository.save(nfce);

      // Update status to processing
      nfce.status = NfceStatus.PROCESSING;
      await this.nfceRepository.save(nfce);

      // Sign XML
      const signedXml = await this.xmlSignerService.signXml(nfce.xmlContent);
      nfce.xmlContent = signedXml;

      // Send to SEFAZ
      const sefazResponse = await this.sefazService.authorizeNfce(signedXml);

      // Update with SEFAZ response
      nfce.protocolNumber = sefazResponse.protocolNumber;
      nfce.authorizationCode = sefazResponse.authorizationCode;
      nfce.status = NfceStatus.AUTHORIZED;

      await this.nfceRepository.save(nfce);

      // Publish event
      await this.fiscalProducer.publishNfceIssued({
        id: nfce.id,
        establishmentId: nfce.establishmentId,
        number: nfce.number,
        series: nfce.series,
        totalValue: nfce.totalValue,
        protocolNumber: nfce.protocolNumber,
        authorizationCode: nfce.authorizationCode,
      });

      return this.mapToDto(nfce);
    } catch (error) {
      // Publish failure event
      await this.fiscalProducer.publishNfceFailed({
        establishmentId: dto.establishmentId,
        number: dto.number,
        series: dto.series,
        error: error.message,
      });

      throw new HttpException(
        `Failed to generate NFC-e: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get NFC-e by ID
   */
  async getNfceById(id: string): Promise<NfceResponseDto> {
    const nfce = await this.nfceRepository.findOne({ where: { id } });

    if (!nfce) {
      throw new HttpException('NFC-e not found', HttpStatus.NOT_FOUND);
    }

    return this.mapToDto(nfce);
  }

  /**
   * List NFC-es by establishment
   */
  async listNfces(establishmentId: string): Promise<NfceResponseDto[]> {
    const nfces = await this.nfceRepository.find({
      where: { establishmentId },
      order: { createdAt: 'DESC' },
    });

    return nfces.map((nfce) => this.mapToDto(nfce));
  }

  /**
   * Cancel NFC-e
   */
  async cancelNfce(id: string, justification: string): Promise<NfceResponseDto> {
    const nfce = await this.nfceRepository.findOne({ where: { id } });

    if (!nfce) {
      throw new HttpException('NFC-e not found', HttpStatus.NOT_FOUND);
    }

    if (nfce.status !== NfceStatus.AUTHORIZED) {
      throw new HttpException(
        'Only authorized NFC-es can be cancelled',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Cancel in SEFAZ
    await this.sefazService.cancelNfce(nfce.protocolNumber, justification);

    // Update status
    nfce.status = NfceStatus.CANCELLED;
    await this.nfceRepository.save(nfce);

    return this.mapToDto(nfce);
  }

  private buildXmlContent(dto: GenerateNfceDto): string {
    // TODO: Implement actual XML building according to NFC-e specification
    return `<?xml version="1.0" encoding="UTF-8"?>
<NFe>
  <infNFe Id="NFe${dto.series}${dto.number}">
    <ide>
      <cUF>43</cUF>
      <AAMM>${new Date().toISOString().substring(0, 7).replace('-', '')}</AAMM>
      <assinaturaQRCode></assinaturaQRCode>
    </ide>
    <emit>
      <CNPJ>${dto.establishmentId}</CNPJ>
    </emit>
    <total>
      <ICMSTot>
        <vNF>${dto.totalValue}</vNF>
      </ICMSTot>
    </total>
  </infNFe>
</NFe>`;
  }

  private mapToDto(nfce: NfceEntity): NfceResponseDto {
    return {
      id: nfce.id,
      establishmentId: nfce.establishmentId,
      number: nfce.number,
      series: nfce.series,
      totalValue: nfce.totalValue,
      status: nfce.status,
      protocolNumber: nfce.protocolNumber,
      authorizationCode: nfce.authorizationCode,
      rejectionReason: nfce.rejectionReason,
      createdAt: nfce.createdAt,
      updatedAt: nfce.updatedAt,
    };
  }
}
