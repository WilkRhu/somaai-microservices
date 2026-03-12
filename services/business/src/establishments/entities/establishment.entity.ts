import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { EstablishmentMember } from './establishment-member.entity';

@Entity('establishments')
@Index('idx_establishments_cnpj', ['cnpj'], { unique: true })
@Index('idx_establishments_ownerId', ['ownerId'])
export class Establishment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 18, unique: true })
  cnpj: string;

  @Column({ type: 'varchar', length: 100 })
  type: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 2, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  zipCode: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'text', nullable: true })
  businessHours: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 1 })
  cashRegistersCount: number;

  @Column({ type: 'boolean', default: false })
  loyaltyEnabled: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 3, default: 0 })
  loyaltyPointsPerReal: number;

  @Column({ type: 'varchar', length: 36 })
  ownerId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @OneToMany(() => EstablishmentMember, (member) => member.establishment, {
    cascade: true,
  })
  members: EstablishmentMember[];
}
