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
import { INTERVIEW_SLOT_STATUS } from 'src/libs/constant/status';
import { Candidate } from 'src/modules/user/entities/candidate.entity';
import { Rating } from 'src/modules/rating/rating.entity';

@Entity()
export class InterviewSlot {
  @PrimaryGeneratedColumn('uuid')
  slotId: string;

  @ManyToOne(() => Candidate, (candidate) => candidate.interviewSlots)
  @JoinColumn({ name: 'candidateId' })
  candidate: Candidate;

  @Column({
    type: 'enum',
    enum: INTERVIEW_SLOT_STATUS,
    default: INTERVIEW_SLOT_STATUS.AVAILABLE,
  })
  status: INTERVIEW_SLOT_STATUS;

  @ManyToOne(() => InterviewSession, (session) => session.interviewSlots)
  @JoinColumn({ name: 'sessionId' })
  interviewSession: InterviewSession;

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

  @OneToOne(() => Rating, (rating) => rating.slot, {
    nullable: true,
    cascade: true,
  })
  rating: Rating;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ nullable: true })
  resumeUrl: string;

  @Column({ type: 'text', nullable: true })
  cancelReason: string;

  @Column({ nullable: true })
  candidateWaitToPay: string; // id of candidate process paying
}
