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
import { Mentor } from 'src/modules/user/entities/mentor.entity';
import { Technology } from 'src/modules/technology/technology.entity';
import { Major } from 'src/modules/major/major.entity';
import { Level } from 'src/modules/level/level.entity';
import { IsNumber } from 'class-validator';
import { INTERVIEW_SESSION_STATUS } from 'src/libs/constant/status';

@Entity()
export class InterviewSession {
  @PrimaryGeneratedColumn('uuid')
  sessionId: string;

  @ManyToOne(() => Mentor)
  @JoinColumn({ name: 'mentorId' })
  mentor: Mentor;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  totalSlots: number;

  @Column()
  slotDuration: number; // thời lượng mỗi slot (phút)

  @Column({
    type: 'enum',
    enum: INTERVIEW_SESSION_STATUS,
    default: INTERVIEW_SESSION_STATUS.UPCOMING,
  })
  status: INTERVIEW_SESSION_STATUS;

  @ManyToMany(() => Major)
  @JoinTable({
    name: 'interviewSession_majors',
    joinColumn: {
      name: 'sessionId',
      referencedColumnName: 'sessionId',
    },
    inverseJoinColumn: {
      name: 'majorId',
      referencedColumnName: 'id',
    },
  })
  majors: Major[];

  @ManyToOne(() => Level)
  @JoinColumn({ name: 'level_id' })
  level: Level;

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

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  requirement?: string;

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
