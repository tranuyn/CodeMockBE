import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { InterviewSlot } from '../../interview_slot/entities/interviewSlot.entity';

@Entity()
export class InterviewSession {
  @PrimaryGeneratedColumn('uuid')
  sessionId: string;

  @Column('simple-array')
  candidate_id: string[];

  @Column()
  mentorId: string;

  @Column({ type: 'timestamp' })
  scheduleDateTime: Date;

  @Column()
  duration: number;

  @Column()
  status: string;

  @Column()
  major_id: string;

  @Column()
  level_id: string;

  @Column('simple-array')
  requiredTechnology: string[];

  @Column()
  sessionPrice: number;

  @Column({ nullable: true })
  meetingLink: string;

  @Column({ nullable: true })
  recordingURL: string;

  @OneToMany(() => InterviewSlot, (slot) => slot.interviewSession)
  interviewSlots: InterviewSlot[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
