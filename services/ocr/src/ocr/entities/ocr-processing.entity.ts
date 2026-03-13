import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('ocr_processing')
@Index(['status'])
@Index(['documentType'])
export class OcrProcessing {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  fileName!: string;

  @Column({ type: 'varchar', length: 50 })
  documentType!: string; // nfce, receipt, invoice, etc

  @Column({ type: 'longblob' })
  imageData!: Buffer;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status!: string; // pending, processing, completed, failed

  @Column({ type: 'longtext', nullable: true })
  extractedText!: string;

  @Column({ type: 'json', nullable: true })
  extractedData!: Record<string, any>;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidence!: number;

  @Column({ type: 'text', nullable: true })
  errorMessage!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referenceId!: string; // ID da venda, nota fiscal, etc

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt!: Date;
}
