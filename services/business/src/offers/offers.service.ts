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
    const salePrice = item ? parseFloat(item.salePrice as any) : 0;
    const offerPrice = parseFloat(offer.offerPrice as any);
    const discountPercentage = salePrice > 0
      ? Math.round(((salePrice - offerPrice) / salePrice) * 100 * 100) / 100
      : 0;
    return {
      ...offer,
      discountPercentage,
      item: item ? {
        id: item.id,
        name: item.name,
        brand: item.brand,
        category: item.category,
        salePrice: item.salePrice,
        quantity: item.quantity,
        unit: item.unit,
        images: item.images,
      } : null,
    };
  }
  async getActiveOfferForItem(itemId: string): Promise<Offer | null> {
    const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
    const offer = await this.offerRepository
      .createQueryBuilder('offer')
      .where('offer.itemId = :itemId', { itemId })
      .andWhere('offer.isActive = :isActive', { isActive: true })
      .andWhere('offer.startDate <= :today', { today })
      .andWhere(
        '(offer.endDate >= :today OR offer.endDate IS NULL OR offer.whileStockLasts = :whileStockLasts)',
        { today, whileStockLasts: true },
      )
      .orderBy('offer.offerPrice', 'ASC')
      .getOne();
    return offer || null;
  }

  async findActiveOffer(establishmentId: string, offerId: string) {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId, establishmentId, isActive: true },
    });
    return offer ? this.withItemName(offer) : null;
  }

  async createOffer(createOfferDto: any) {
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
