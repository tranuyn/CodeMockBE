import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, ChildEntity } from 'typeorm';
import { ExperienceDetail } from 'src/modules/common_entity/experience_detail.entity';

@ChildEntity('MENTOR') // overide role in user
export class Mentor extends User {
  @Column('json', { nullable: true })
  current_activities: ExperienceDetail[];

  @Column('text', { array: true, nullable: true })
  specialization_skill: string[];

  @Column({ nullable: true })
  averageRating: number;

  @Column({ nullable: true })
  totalInterviews: number;
  //total interview
}
