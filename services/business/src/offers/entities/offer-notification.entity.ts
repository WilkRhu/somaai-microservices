import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('offer_notifications')
@Index('idx_notifications_offer_customer', ['offerId', 'customerId'])
export class OfferNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 36 })
  offerId: string;

  @Column('varchar', { length: 36 })
  customerId: string;

  @Column('timestamp', { nullable: true })
  sentAt: Date;

  @Column('timestamp', { nullable: true })
  viewedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
