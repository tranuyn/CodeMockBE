import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { InterviewSession } from 'src/modules/interview_session/entities/interview_session.entity';
import { Candidate } from 'src/modules/user/entities/candidate.entity';
import { InterviewSlot } from '../interview_slot/entities/interviewSlot.entity';
import { Mentor } from '../user/entities/mentor.entity';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  ratingId: string;

  @ManyToOne(() => Candidate)
  @JoinColumn({ name: 'candidateId' })
  candidate: Candidate;

  @OneToOne(() => InterviewSlot, (slot) => slot.rating) // Đổi thành ManyToOne
  @JoinColumn({ name: 'slotId' })
  slot: InterviewSlot;

  @ManyToOne(() => Mentor)
  @JoinColumn({ name: 'mentorId' })
  mentor: Mentor;

  @ManyToOne(() => InterviewSession)
  @JoinColumn({ name: 'sessionId' })
  interviewSession: InterviewSession;

  @Column({ nullable: true })
  ratingStar: number;

  @Column({ nullable: true })
  comment: string;
}
