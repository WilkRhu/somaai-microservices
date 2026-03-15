import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('establishment_mercadopago_integrations')
@Index('idx_mp_establishmentId', ['establishmentId'], { unique: true })
export class MercadopagoIntegration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36 })
  establishmentId: string;

  @Column({ type: 'varchar', length: 255 })
  accessToken: string;

  @Column({ type: 'varchar', length: 255 })
  publicKey: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  merchantAccountId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  merchantName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  merchantEmail: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'json', nullable: true })
  webhookConfig: any;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
