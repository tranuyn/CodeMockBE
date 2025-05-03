import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InterviewSlot } from '../../interview_slot/entities/interviewSlot.entity';
import { Mentor } from 'src/modules/user/entities/mentor.entity';

@Entity()
export class InterviewSession {
  @PrimaryGeneratedColumn('uuid')
  sessionId: string;

  @ManyToOne(() => Mentor)
  @JoinColumn({ name: 'mentorId' })
  mentor: Mentor;

  @Column({ type: 'timestamp' })
  scheduleDateTime: Date;

  @Column()
  duration: number; // tổng thời lượng toàn buổi (phút)

  @Column()
  slotDuration: number; // thời lượng mỗi slot (phút)

  @Column()
  status: string;

  @Column('simple-array')
  major_id: string[];

  @Column()
  level_id: string;

  @Column({ type: 'simple-array', nullable: true })
  requiredTechnology: string[];

  @Column()
  sessionPrice: number;

  @Column({ nullable: true })
  meetingLink: string;

  @Column({ nullable: true })
  recordingURL: string;

  @OneToMany(() => InterviewSlot, (slot) => slot.interviewSession, {
    cascade: true,
  })
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
