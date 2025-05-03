import { User } from 'src/modules/user/entities/user.entity';
import { Column, ChildEntity, OneToMany } from 'typeorm';
import { ExperienceDetail } from 'src/modules/common_entity/experience_detail.entity';
import { InterviewSlot } from 'src/modules/interview_slot/entities/interviewSlot.entity';

@ChildEntity('CANDIDATE') // overide role in user
export class Candidate extends User {
  @Column({ nullable: true })
  resumeUrl: string;

  @Column('json', { array: true, nullable: true })
  educationBackground: ExperienceDetail[];

  @Column('text', { array: true, nullable: true })
  biography: string[];

  @Column({ nullable: true })
  average_point: number;

  @OneToMany(() => InterviewSlot, (session) => session.candidate)
  interviewSlots: InterviewSlot[];
}
