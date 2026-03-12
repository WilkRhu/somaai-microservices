import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OfferEntity, OfferStatus } from './entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { OfferResponseDto } from './dto/offer-response.dto';
import { OffersProducerService } from '../kafka/offers.producer';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(OfferEntity)
    private offerRepository: Repository<OfferEntity>,
    private offersProducer: OffersProducerService,
  ) {}

  async createOffer(dto: CreateOfferDto): Promise<OfferResponseDto> {
    try {
      const offer = this.offerRepository.create({
        name: dto.name,
        description: dto.description,
        discountPercentage: dto.discountPercentage,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: OfferStatus.ACTIVE,
      });

      await this.offerRepository.save(offer);

      await this.offersProducer.publishOfferCreated({
        id: offer.id,
        name: offer.name,
        discountPercentage: offer.discountPercentage,
      });

      return this.mapToDto(offer);
    } catch (error) {
      throw new HttpException(
        `Failed to create offer: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getOfferById(id: string): Promise<OfferResponseDto> {
    const offer = await this.offerRepository.findOne({ where: { id } });

    if (!offer) {
      throw new HttpException('Offer not found', HttpStatus.NOT_FOUND);
    }

    return this.mapToDto(offer);
  }

  async listOffers(status?: string): Promise<OfferResponseDto[]> {
    const query = this.offerRepository.createQueryBuilder('offer');

    if (status) {
      query.where('offer.status = :status', { status });
    }

    const offers = await query.orderBy('offer.createdAt', 'DESC').getMany();

    return offers.map((offer) => this.mapToDto(offer));
  }

  async updateOffer(id: string, dto: UpdateOfferDto): Promise<OfferResponseDto> {
    const offer = await this.offerRepository.findOne({ where: { id } });

    if (!offer) {
      throw new HttpException('Offer not found', HttpStatus.NOT_FOUND);
    }

    Object.assign(offer, dto);
    await this.offerRepository.save(offer);

    await this.offersProducer.publishOfferUpdated({
      id: offer.id,
      name: offer.name,
      discountPercentage: offer.discountPercentage,
    });

    return this.mapToDto(offer);
  }

  async deleteOffer(id: string): Promise<void> {
    const offer = await this.offerRepository.findOne({ where: { id } });

    if (!offer) {
      throw new HttpException('Offer not found', HttpStatus.NOT_FOUND);
    }

    await this.offerRepository.remove(offer);

    await this.offersProducer.publishOfferDeleted({
      id: offer.id,
      name: offer.name,
    });
  }

  private mapToDto(offer: OfferEntity): OfferResponseDto {
    return {
      id: offer.id,
      name: offer.name,
      description: offer.description,
      discountPercentage: offer.discountPercentage,
      startDate: offer.startDate,
      endDate: offer.endDate,
      status: offer.status,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
    };
  }
}
