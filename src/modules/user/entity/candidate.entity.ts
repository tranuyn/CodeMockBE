import { User } from 'src/modules/user/entity/user.entity';
import { Column, Entity, ChildEntity } from 'typeorm';
import { ExperienceDetail } from 'src/modules/common_entity/experience_detail.entity';

@ChildEntity('CANDIDATE') // overide role in user
export class Candidate extends User {
  @Column({ nullable: true })
  resumeUrl: string;

  @Column('json', { array: true, nullable: true })
  educationBackground: ExperienceDetail[];

  @Column('text', { array: true, nullable: true })
  biography: String[];

  @Column({ nullable: true })
  average_point: number;
}
