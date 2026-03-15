import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Establishment } from '../../establishments/entities/establishment.entity';
import { User } from './user.entity';

@Entity('establishment_users')
export class EstablishmentUser {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 36 })
  establishmentId: string;

  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @Column({ type: 'varchar', length: 50 })
  role: string; // business_owner, business_admin, business_sales, business_stock, business_marketing

  @Column({ type: 'varchar', length: 36, nullable: true })
  invitedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  invitedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt: Date;

  @Column({ type: 'varchar', length: 50, default: 'ACTIVE' })
  status: string; // ACTIVE, INACTIVE, PENDING

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Establishment)
  @JoinColumn({ name: 'establishmentId' })
  establishment: Establishment;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
