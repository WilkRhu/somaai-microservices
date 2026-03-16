import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('suppliers')
@Index('idx_suppliers_establishmentId', ['establishmentId'])
@Index('idx_suppliers_cnpj', ['cnpj'])
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 36 })
  establishmentId: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Column('varchar', { length: 18, nullable: true })
  cnpj: string;

  @Column('varchar', { length: 255, nullable: true })
  email: string;

  @Column('varchar', { length: 20, nullable: true })
  phone: string;

  @Column('text', { nullable: true })
  address: string;

  @Column('varchar', { length: 255, nullable: true })
  street: string;

  @Column('varchar', { length: 20, nullable: true })
  number: string;

  @Column('varchar', { length: 100, nullable: true })
  complement: string;

  @Column('varchar', { length: 100, nullable: true })
  neighborhood: string;

  @Column('varchar', { length: 100, nullable: true })
  city: string;

  @Column('varchar', { length: 2, nullable: true })
  state: string;

  @Column('varchar', { length: 10, nullable: true })
  zipCode: string;

  @Column('varchar', { length: 255, nullable: true })
  contactPerson: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column('varchar', { length: 500, nullable: true })
  image: string;

  @Column('boolean', { default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
