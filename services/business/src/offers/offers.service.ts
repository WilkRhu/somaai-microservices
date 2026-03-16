import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { OfferNotification } from './entities/offer-notification.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    @InjectRepository(OfferNotification)
    private readonly offerNotificationRepository: Repository<OfferNotification>,
    @InjectRepository(InventoryItem)
    private readonly inventoryRepository: Repository<InventoryItem>,
  ) {}

  private async withItemName(offer: Offer) {
    const item = offer.itemId
      ? await this.inventoryRepository.findOne({ where: { id: offer.itemId } })
      : null;
    return { ...offer, itemName: item?.name ?? null };
  }

  async findActiveOffer(establishmentId: string, offerId: string) {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId, establishmentId, isActive: true },
    });
    return offer ? this.withItemName(offer) : null;
  }

  async createOffer(createOfferDto: any) {
    // Calcula endDate a partir de durationHours se não fornecido
    if (!createOfferDto.endDate && createOfferDto.durationHours) {
      const start = new Date(createOfferDto.startDate);
      createOfferDto.endDate = new Date(start.getTime() + createOfferDto.durationHours * 60 * 60 * 1000);
    }
    delete createOfferDto.durationHours;

    const offer = this.offerRepository.create(createOfferDto);
    const saved = await this.offerRepository.save(offer) as unknown as Offer;
    return this.withItemName(saved);
  }

  async findAllOffers(establishmentId: string, isActive?: boolean) {
    const where: any = { establishmentId };
    if (isActive !== undefined) where.isActive = isActive;
    const offers = await this.offerRepository.find({ where, order: { createdAt: 'DESC' } });
    return Promise.all(offers.map((o) => this.withItemName(o)));
  }

  async findOneOffer(id: string) {
    const offer = await this.offerRepository.findOne({ where: { id } });
    return offer ? this.withItemName(offer) : null;
  }

  async updateOffer(id: string, updateOfferDto: any) {
    await this.offerRepository.update(id, updateOfferDto);
    return this.findOneOffer(id);
  }

  async removeOffer(id: string) {
    await this.offerRepository.delete(id);
  }

  async createNotification(createNotificationDto: any) {
    const notification = this.offerNotificationRepository.create(createNotificationDto);
    return await this.offerNotificationRepository.save(notification);
  }

  async findAllNotifications(offerId: string) {
    return await this.offerNotificationRepository.find({
      where: { offerId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsViewed(notificationId: string) {
    await this.offerNotificationRepository.update(notificationId, { viewedAt: new Date() });
    return await this.offerNotificationRepository.findOne({ where: { id: notificationId } });
  }
}
