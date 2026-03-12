import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { OfferNotification } from './entities/offer-notification.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(OfferNotification)
    private readonly offerNotificationRepository: Repository<OfferNotification>,
  ) {}

  async createOffer(createOfferDto: any) {
    const offer = this.offerRepository.create(createOfferDto);
    return await this.offerRepository.save(offer);
  }

  async findAllOffers(establishmentId: string) {
    return await this.offerRepository.find({
      where: { establishmentId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneOffer(id: string) {
    return await this.offerRepository.findOne({ where: { id } });
  }

  async updateOffer(id: string, updateOfferDto: any) {
    await this.offerRepository.update(id, updateOfferDto);
    return await this.findOneOffer(id);
  }

  async removeOffer(id: string) {
    await this.offerRepository.delete(id);
  }

  async createNotification(createNotificationDto: any) {
    const notification = this.offerNotificationRepository.create(
      createNotificationDto,
    );
    return await this.offerNotificationRepository.save(notification);
  }

  async findAllNotifications(offerId: string) {
    return await this.offerNotificationRepository.find({
      where: { offerId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsViewed(notificationId: string) {
    await this.offerNotificationRepository.update(notificationId, {
      viewedAt: new Date(),
    });
    return await this.offerNotificationRepository.findOne({
      where: { id: notificationId },
    });
  }
}
