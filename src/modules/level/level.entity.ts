import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';

@Entity('level')
export class Level {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ default: 0 })
  user_count: number;

  @OneToMany(() => User, (user) => user.level)
  users: User[];
}
