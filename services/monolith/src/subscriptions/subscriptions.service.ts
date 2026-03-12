import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionResponseDto } from './dto/subscription-response.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
  ) {}

  async create(
    userId: string,
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<SubscriptionResponseDto> {
    const subscription = this.subscriptionsRepository.create({
      userId,
      ...createSubscriptionDto,
      status: 'active',
      startDate: new Date(),
      nextBillingDate: this.calculateNextBillingDate(createSubscriptionDto.billingCycle),
    });

    const saved = await this.subscriptionsRepository.save(subscription);
    return this.mapToResponse(saved);
  }

  async findById(id: string): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return this.mapToResponse(subscription);
  }

  async findByUserId(userId: string): Promise<SubscriptionResponseDto[]> {
    const subscriptions = await this.subscriptionsRepository.find({
      where: { userId },
    });

    return subscriptions.map((s) => this.mapToResponse(s));
  }

  async findByEstablishmentId(establishmentId: string): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { establishmentId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return this.mapToResponse(subscription);
  }

  async update(
    id: string,
    updateData: Partial<CreateSubscriptionDto>,
  ): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    Object.assign(subscription, updateData);
    const updated = await this.subscriptionsRepository.save(subscription);
    return this.mapToResponse(updated);
  }

  async cancel(id: string): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    subscription.status = 'cancelled';
    subscription.endDate = new Date();
    const updated = await this.subscriptionsRepository.save(subscription);
    return this.mapToResponse(updated);
  }

  private calculateNextBillingDate(billingCycle: string): Date {
    const date = new Date();
    if (billingCycle === 'monthly') {
      date.setMonth(date.getMonth() + 1);
    } else if (billingCycle === 'yearly') {
      date.setFullYear(date.getFullYear() + 1);
    }
    return date;
  }

  private mapToResponse(subscription: Subscription): SubscriptionResponseDto {
    return {
      id: subscription.id,
      userId: subscription.userId,
      establishmentId: subscription.establishmentId,
      planName: subscription.planName,
      price: Number(subscription.price),
      billingCycle: subscription.billingCycle,
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      nextBillingDate: subscription.nextBillingDate,
      autoRenew: subscription.autoRenew,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }
}
