import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('notification_preferences')
@Unique(['userId'])
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 36 })
  userId!: string;

  @Column({ type: 'boolean', default: true })
  emailEnabled!: boolean;

  @Column({ type: 'boolean', default: true })
  smsEnabled!: boolean;

  @Column({ type: 'boolean', default: true })
  pushEnabled!: boolean;

  @Column({ type: 'boolean', default: true })
  marketingEmails!: boolean;

  @Column({ type: 'boolean', default: true })
  transactionalEmails!: boolean;

  @Column({ type: 'boolean', default: true })
  transactionalSms!: boolean;

  @Column({ type: 'boolean', default: true })
  transactionalPush!: boolean;

  @Column({ type: 'json', nullable: true })
  quietHours?: {
    enabled: boolean;
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    timezone: string;
  };

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
