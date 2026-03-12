import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Purchase } from './purchase.entity';

@Entity('purchase_installments')
@Index(['purchaseId', 'installmentNumber'])
@Index(['dueDate', 'status'])
export class PurchaseInstallment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36 })
  purchaseId: string;

  @Column({ type: 'int' })
  installmentNumber: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'PAID', 'OVERDUE'],
    default: 'PENDING',
  })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  // Relacionamento
  @ManyToOne(() => Purchase, (purchase) => purchase.installmentDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'purchaseId' })
  purchase: Purchase;
}
