import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PurchaseItem } from './purchase-item.entity';
import { PurchaseInstallment } from './purchase-installment.entity';

@Entity('purchases')
@Index(['userId', 'purchasedAt'])
@Index(['userId', 'type', 'purchasedAt'])
export class Purchase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @Column({
    type: 'enum',
    enum: ['market', 'loja', 'shopping', 'outros', 'listacompras', 'Compras Online'],
    default: 'market',
  })
  type: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  merchant: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'COMPLETED', 'CANCELLED'],
    default: 'COMPLETED',
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['pix', 'credit_card', 'debit_card', 'cash', 'bank_slip', 'bank_transfer', 'voucher', 'other'],
    nullable: true,
  })
  paymentMethod: string;

  @Column({ type: 'int', default: 1 })
  installments: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  interestRate: number;

  @Column({ type: 'timestamp' })
  purchasedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relacionamentos
  @ManyToOne(() => User, (user) => user.purchases, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => PurchaseItem, (item) => item.purchase, { cascade: true })
  items: PurchaseItem[];

  @OneToMany(
    () => PurchaseInstallment,
    (installment) => installment.purchase,
    { cascade: true },
  )
  installmentDetails: PurchaseInstallment[];
}
