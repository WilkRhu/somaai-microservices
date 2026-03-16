import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum DeliveryOrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('delivery_orders')
@Index('idx_delivery_orders_establishment', ['establishmentId'])
@Index('idx_delivery_orders_status', ['status'])
export class DeliveryOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 36 })
  establishmentId: string;

  @Column('varchar', { length: 36, nullable: true })
  zoneId: string;

  @Column('varchar', { length: 36, nullable: true })
  customerId: string;

  @Column('varchar', { length: 50, unique: true })
  orderNumber: string;

  @Column({ type: 'enum', enum: DeliveryOrderStatus, default: DeliveryOrderStatus.PENDING })
  status: DeliveryOrderStatus;

  @Column('json', { nullable: true })
  items: Array<{ name: string; quantity: number; unitPrice: number; subtotal: number }>;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  deliveryFee: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total: number;

  @Column('text', { nullable: true })
  deliveryAddress: string;

  @Column('varchar', { length: 100, nullable: true })
  neighborhood: string;

  @Column('varchar', { length: 255, nullable: true })
  customerName: string;

  @Column('varchar', { length: 20, nullable: true })
  customerPhone: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column('datetime', { nullable: true })
  estimatedDeliveryAt: Date;

  @Column('datetime', { nullable: true })
  deliveredAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
