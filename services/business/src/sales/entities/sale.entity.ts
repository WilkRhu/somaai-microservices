import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { SaleStatus } from '../enums/sale-status.enum';
import { PaymentMethod } from '../../shared/enums/payment-method.enum';
import { SaleItem } from './sale-item.entity';

@Entity('sales')
@Index('idx_sales_establishment_created', ['establishmentId', 'createdAt'])
@Index('idx_sales_customerId', ['customerId'])
@Index('idx_sales_status', ['status'])
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 36 })
  establishmentId: string;

  @Column('varchar', { length: 50, unique: true })
  saleNumber: string;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: SaleStatus,
    default: SaleStatus.COMPLETED,
  })
  status: SaleStatus;

  @Column('varchar', { length: 36, nullable: true })
  customerId: string;

  @Column('varchar', { length: 36, nullable: true })
  sellerId: string;

  @Column('int', { nullable: true })
  cashRegisterId: number;

  @Column('text', { nullable: true })
  notes: string;

  @Column('text', { nullable: true })
  cancellationReason: string;

  @Column('varchar', { length: 36, nullable: true })
  fiscalNoteId: string;

  @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true })
  items: SaleItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
