import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { InterviewSession } from 'src/modules/interview_session/entities/interview_session.entity';
import { Feedback } from 'src/modules/feedback/entities/feedback.entity';

@Entity()
export class InterviewSlot {
  @PrimaryGeneratedColumn('uuid')
  slotId: string;

  @Column()
  candidateId: string;

  @Column({ nullable: true })
  note: string;

  @ManyToOne(() => InterviewSession, (session) => session.interviewSlots)
  @JoinColumn({ name: 'sessionId' })
  interviewSession: InterviewSession;

  @Column()
  sessionId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startTime: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  endTime: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToOne(() => Feedback, (feedback) => feedback.slot, {
    cascade: true,
    nullable: true,
  })
  feedback: Feedback;
}
