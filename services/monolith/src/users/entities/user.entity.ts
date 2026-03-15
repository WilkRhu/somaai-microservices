import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { UserAddress } from './user-address.entity';
import { UserCard } from './user-card.entity';
import { Purchase } from '../../purchases/entities/purchase.entity';

@Entity('users')
@Index(['cpf'], { unique: true, where: 'cpf IS NOT NULL' })
export class User {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 14, nullable: true })
  cpf: string;

  @Column({ type: 'varchar', length: 255 })
  firstName: string;

  @Column({ type: 'varchar', length: 255 })
  lastName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string;

  @Column({
    type: 'enum',
    enum: ['EMAIL', 'GOOGLE', 'FACEBOOK'],
    default: 'EMAIL',
  })
  authProvider: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  googleId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  facebookId: string;

  @Column({
    type: 'enum',
    enum: ['user', 'support', 'admin', 'super_admin'],
    default: 'user',
  })
  role: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  planType: string;

  @Column({ type: 'datetime', nullable: true })
  planExpiresAt: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  billingCycle: string;

  @Column({ type: 'boolean', default: false })
  isOnTrial: boolean;

  @Column({ type: 'datetime', nullable: true })
  trialEndsAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  mercadoPagoCustomerId: string;

  @Column({ type: 'boolean', default: false })
  hasCompletedOnboarding: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  netIncome: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profession: string;

  @Column({ type: 'int', default: 0 })
  scansUsed: number;

  @Column({ type: 'datetime', nullable: true })
  scansResetAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date;

  // Relacionamentos
  @OneToMany(() => UserAddress, (address) => address.user, { cascade: true })
  addresses: UserAddress[];

  @OneToMany(() => UserCard, (card) => card.user, { cascade: true })
  cards: UserCard[];

  @OneToMany(() => Purchase, (purchase) => purchase.user, { cascade: true })
  purchases: Purchase[];
}
