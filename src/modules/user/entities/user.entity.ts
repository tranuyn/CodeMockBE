import { Technology } from './../../technology/technology.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  TableInheritance,
  JoinTable,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';
import { ExperienceDetail } from 'src/common/common_entity/experience_detail.entity';
import { Major } from 'src/modules/major/major.entity';
import { Level } from 'src/modules/level/level.entity';
import { SkillItem } from 'src/common/common_entity/skillItem';
import { ROLE } from 'src/common/enums/role.enum';

@Entity({ name: 'user' })
@TableInheritance({ column: { type: 'varchar', name: 'role' } })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true, default: 'LOCAL' })
  account_type: string;

  @Column({ nullable: true, type: 'enum', enum: ROLE, default: ROLE.CANDIDATE })
  role: ROLE;

  @Column({ nullable: true, default: false })
  is_active: boolean;

  @Column({ nullable: true })
  code_id: string;

  @Column({ nullable: true, type: 'timestamp' })
  code_expired: Date;

  @Column({ nullable: true })
  phone: string;

  @ManyToMany(() => Major, (major) => major.users, { cascade: ['insert'] })
  @JoinTable({ name: 'user_majors' })
  majors: Major[];

  // Lưu mảng JSON mà không dùng array: true
  @Column('jsonb', { nullable: true })
  experiences: ExperienceDetail[];

  @ManyToMany(() => Level, (level) => level.users, { cascade: ['insert'] })
  @JoinTable({ name: 'user_levels' })
  levels: Level[];

  @Column('jsonb', { nullable: true })
  skills: SkillItem[];

  @Column({ nullable: true })
  educationLevel: string;

  @ManyToMany(() => Technology, (Technology) => Technology.users, {
    cascade: ['insert'],
  })
  @JoinTable({ name: 'user_technologies' })
  technologies: Technology[];

  @Column({ nullable: true, type: 'timestamp' })
  dateCreated: Date;

  @Column({ nullable: true })
  warning_count: number;

  @Column({ nullable: true, type: 'timestamp' })
  warning_until: Date;

  @Column({ nullable: true, type: 'timestamp' })
  lastLogin: Date;

  @Column({ nullable: true })
  coinBalance: number;

  @Column({ nullable: true })
  avataUrl: string;

  @Column({ nullable: true })
  address: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column('text', { nullable: true })
  biography: string;

  @Column('jsonb', { nullable: true })
  educationBackground: ExperienceDetail[];
}
