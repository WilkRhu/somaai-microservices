import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { StockMovementType } from '../enums/stock-movement-type.enum';

@Entity('stock_movements')
@Index(['inventoryItemId'])
@Index(['saleId'])
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 36 })
  inventoryItemId: string;

  @Column('varchar', { length: 36, nullable: true })
  saleId: string;

  @Column({
    type: 'enum',
    enum: StockMovementType,
  })
  type: StockMovementType;

  @Column('int')
  quantity: number;

  @Column('varchar', { length: 255, nullable: true })
  reason: string;

  @Column('text', { nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
