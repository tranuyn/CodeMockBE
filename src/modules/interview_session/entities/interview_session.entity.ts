import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { InterviewSlot } from '../../interview_slot/entities/interviewSlot.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Technology } from 'src/modules/technology/technology.entity';

@Entity()
export class InterviewSession {
  @PrimaryGeneratedColumn('uuid')
  sessionId: string;

  @ManyToOne(() => User, (user) => user.sessionsAsMentor)
  @JoinColumn({ name: 'mentorId' })
  mentor: User;

  @Column()
  mentorId: string;

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

  @ManyToMany(() => Technology)
  @JoinTable({
    name: 'interviewSession_technologies',
    joinColumn: {
      name: 'sessionId',
      referencedColumnName: 'sessionId',
    },
    inverseJoinColumn: {
      name: 'technologyId',
      referencedColumnName: 'id',
    },
  })
  requiredTechnologies: Technology[];

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
