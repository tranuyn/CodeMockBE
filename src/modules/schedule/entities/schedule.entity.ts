import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { InterviewSession } from 'src/modules/interview_session/entities/interview_session.entity';

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn()
  scheduleId: string;

  @Column()
  userId: string;

  @Column()
  user_role: string;

  @Column({ nullable: true })
  note: string;

  @OneToMany(() => InterviewSession, (session) => session.schedule)
  interviewSessions: InterviewSession[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
