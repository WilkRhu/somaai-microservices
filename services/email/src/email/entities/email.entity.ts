import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EmailStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  BOUNCED = 'bounced',
}

@Entity('emails')
export class EmailEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  to!: string;

  @Column({ nullable: true })
  cc?: string;

  @Column({ nullable: true })
  bcc?: string;

  @Column()
  subject!: string;

  @Column('text')
  htmlContent!: string;

  @Column('text', { nullable: true })
  textContent?: string;

  @Column({ nullable: true })
  templateId?: string;

  @Column('json', { nullable: true })
  templateData?: Record<string, any>;

  @Column({
    type: 'enum',
    enum: EmailStatus,
    default: EmailStatus.PENDING,
  })
  status!: EmailStatus;

  @Column({ nullable: true })
  externalId?: string;

  @Column({ nullable: true })
  failureReason?: string;

  @Column({ default: 0 })
  opens!: number;

  @Column({ default: 0 })
  clicks!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt?: Date;
}
