import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('offers')
@Index('idx_offers_establishment_active', ['establishmentId', 'isActive'])
@Index('idx_offers_itemId', ['itemId'])
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 36 })
  establishmentId: string;

  @Column('varchar', { length: 36, nullable: true })
  itemId: string;

  @Column('varchar', { length: 255, nullable: true })
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  offerPrice: number;

  @Column('date', { nullable: true })
  startDate: Date;

  @Column('date', { nullable: true })
  endDate: Date;

  @Column('boolean', { default: false })
  whileStockLasts: boolean;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  radiusKm: number;

  @Column('boolean', { default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
