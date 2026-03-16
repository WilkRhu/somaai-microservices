import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PurchaseOrderStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('purchase_orders')
@Index('idx_po_establishment_status', ['establishmentId', 'status'])
@Index('idx_po_supplierId', ['supplierId'])
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 36 })
  establishmentId: string;

  @Column('varchar', { length: 36 })
  supplierId: string;

  @Column('varchar', { length: 36, nullable: true })
  createdById: string;

  @Column('varchar', { length: 50, unique: true })
  orderNumber: string;

  @Column({
    type: 'enum',
    enum: PurchaseOrderStatus,
    default: PurchaseOrderStatus.PENDING,
  })
  status: PurchaseOrderStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column('json', { nullable: true })
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;

  @Column('date', { nullable: true })
  expectedDeliveryDate: Date;

  @Column('date', { nullable: true })
  deliveredDate: Date;

  @Column('text', { nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
