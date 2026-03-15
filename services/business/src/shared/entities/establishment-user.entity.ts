import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Establishment } from '../../establishments/entities/establishment.entity';

@Entity('establishment_users')
export class EstablishmentUser {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 36 })
  establishmentId: string;

  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @Column({ type: 'varchar', length: 50 })
  role: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  invitedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  invitedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt: Date;

  @Column({ type: 'varchar', length: 50, default: 'ACTIVE' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Establishment)
  @JoinColumn({ name: 'establishmentId' })
  establishment: Establishment;
}
