import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ExpenseCategory } from '../enums/expense-category.enum';
import { ExpenseStatus } from '../enums/expense-status.enum';
import { PaymentMethod } from '../../shared/enums/payment-method.enum';

@Entity('expenses')
@Index('idx_expenses_establishment_date', ['establishmentId', 'expenseDate'])
@Index('idx_expenses_establishment_status', ['establishmentId', 'status'])
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 36 })
  establishmentId: string;

  @Column('varchar', { length: 36, nullable: true })
  supplierId: string;

  @Column('varchar', { length: 36, nullable: true })
  createdById: string;

  @Column({ type: 'enum', enum: ExpenseCategory })
  category: ExpenseCategory;

  @Column('varchar', { length: 255 })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
  paymentMethod: PaymentMethod;

  @Column({ type: 'enum', enum: ExpenseStatus, default: ExpenseStatus.PENDING })
  status: ExpenseStatus;

  @Column('date')
  expenseDate: Date;

  @Column('date', { nullable: true })
  dueDate: Date;

  @Column('date', { nullable: true })
  paymentDate: Date;

  @Column('boolean', { default: false })
  isRecurring: boolean;

  @Column('varchar', { length: 50, nullable: true })
  recurrenceInterval: string;

  @Column('text', { nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
