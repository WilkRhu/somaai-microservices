import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('delivery_zones')
@Index('idx_delivery_zones_establishment', ['establishmentId'])
export class DeliveryZone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 36 })
  establishmentId: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('json', { nullable: true })
  neighborhoods: string[];

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  deliveryFee: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  freeDeliveryMinimum: number;

  @Column('int', { nullable: true })
  estimatedTime: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  radiusKm: number;

  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  centerLatitude: number;

  @Column('decimal', { precision: 10, scale: 6, nullable: true })
  centerLongitude: number;

  @Column('boolean', { default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
