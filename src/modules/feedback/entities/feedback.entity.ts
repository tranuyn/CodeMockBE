import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { InterviewSlot } from 'src/modules/interview_slot/entities/interviewSlot.entity';

@Entity()
export class Feedback {
  @PrimaryGeneratedColumn()
  feedbackId: number;

  @Column()
  sessionId: number;

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
