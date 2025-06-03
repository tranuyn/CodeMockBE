import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface ExperienceDetail {
  position: string;
  work_space: string;
  url_company: string; //option
  yearStart: number;
  yearEnd: number;
  imageUrl: string;
}
