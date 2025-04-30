import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
  JoinTable,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';

@Entity('technology')
export class Technology {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ default: 0 })
  user_count: number;

  @ManyToMany(() => User, (user) => user.technologies)
  users: User[];
}
