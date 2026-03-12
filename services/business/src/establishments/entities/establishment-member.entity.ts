import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Establishment } from './establishment.entity';

@Entity('establishment_members')
@Index('idx_members_establishmentId', ['establishmentId'])
@Index('idx_members_userId', ['userId'])
export class EstablishmentMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36 })
  establishmentId: string;

  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @Column({
    type: 'enum',
    enum: ['OWNER', 'MANAGER', 'CASHIER', 'DELIVERY'],
    default: 'CASHIER',
  })
  role: string;

  @CreateDateColumn()
  joinedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Establishment, (est) => est.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'establishmentId' })
  establishment: Establishment;
}
