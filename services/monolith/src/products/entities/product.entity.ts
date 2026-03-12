import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { PurchaseItem } from '../../purchases/entities/purchase-item.entity';

@Entity('products')
@Index(['barcode'], { unique: true, where: 'barcode IS NOT NULL' })
@Index(['gtin'], { unique: true, where: 'gtin IS NOT NULL' })
@Index(['name'])
@Index(['category'])
@Index(['brand'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  barcode: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  brand: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  costPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  salePrice: number;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'int', default: 0 })
  minQuantity: number;

  @Column({ type: 'varchar', length: 20, default: 'un' })
  unit: string;

  @Column({ type: 'date', nullable: true })
  expirationDate: Date;

  @Column({ type: 'text', nullable: true })
  images: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 8, nullable: true })
  ncm: string;

  @Column({ type: 'varchar', length: 4, nullable: true })
  cfop: string;

  @Column({ type: 'varchar', length: 3, nullable: true })
  cst: string;

  @Column({ type: 'varchar', length: 4, nullable: true })
  csosn: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  aliquotaIcms: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  aliquotaPis: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  aliquotaCofins: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  aliquotaIpi: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  fiscalUnit: string;

  @Column({ type: 'varchar', length: 14, nullable: true })
  gtin: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  // Relacionamentos
  @OneToMany(() => PurchaseItem, (item) => item.product)
  purchaseItems: PurchaseItem[];
}
