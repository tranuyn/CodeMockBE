import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Schedule } from '../../schedule/entities/schedule.entity';

@Entity()
export class InterviewSession {
  @PrimaryGeneratedColumn()
  sessionId: number;

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

  @ManyToOne(() => Schedule, (schedule) => schedule.interviewSessions)
  @JoinColumn({ name: 'scheduleId' })
  schedule: Schedule;

  @Column()
  scheduleId: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
