import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum NfceStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  AUTHORIZED = 'authorized',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

@Entity('nfces')
export class NfceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  establishmentId: string;

  @Column()
  number: number;

  @Column()
  series: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalValue: number;

  @Column('text')
  xmlContent: string;

  @Column({ nullable: true })
  protocolNumber: string;

  @Column({ nullable: true })
  authorizationCode: string;

  @Column({
    type: 'enum',
    enum: NfceStatus,
    default: NfceStatus.PENDING,
  })
  status: NfceStatus;

  @Column({ nullable: true })
  rejectionReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
