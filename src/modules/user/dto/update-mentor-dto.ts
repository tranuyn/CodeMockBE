import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, ChildEntity } from 'typeorm';
import { ExperienceDetail } from 'src/common/common_entity/experience_detail.entity';
import { UpdateUserDto } from './update-user.dto';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@ChildEntity('CANDIDATE') // overide role in user
export class UpdateMentorDto extends UpdateUserDto {
  @IsOptional()
  current_activities: ExperienceDetail[];

  @IsOptional()
  experiences: ExperienceDetail[];

  @IsOptional()
  specialization_skill: string[];
  averageRating: number;

  @IsOptional()
  totalInterviews: number;
  //total interview
  //availabilitySchedule: Schedule
}
