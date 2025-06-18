import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  OneToOne,
  ManyToOne,
} from 'typeorm';
import { InterviewSlot } from 'src/modules/interview_slot/entities/interviewSlot.entity';
import { InterviewSession } from 'src/modules/interview_session/entities/interview_session.entity';

@Entity()
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  feedbackId: string;

  @ManyToOne(() => InterviewSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sessionId' })
  session: InterviewSession;

  @Column({ type: 'text' })
  strengths: string;

  @Column({ type: 'text' })
  improvementAreas: string;

  @Column({ type: 'text' })
  overallPerformance: string;

  @Column('float')
  technicalScore: number;

  @Column('float')
  communicationScore: number;

  @Column('float')
  problemSolvingScore: number;

  @CreateDateColumn()
  createAt: Date;

  @OneToOne(() => InterviewSlot, (slot) => slot.feedback, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'slotId' })
  slot: InterviewSlot;
}
