import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity() // This decorator tells TypeORM that this class represents a table in the database.
export class User {
  @PrimaryGeneratedColumn('uuid') // This decorator tells TypeORM that this column will be used as the primary key for this entity.
  id: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true, default: 'LOCAL' })
  account_type: string;

  @Column({ nullable: true, default: 'USER' })
  role: string;

  @Column({ nullable: true, default: false })
  is_active: boolean;

  @Column({ nullable: true })
  code_id: string;

  @Column({ nullable: true })
  code_expired: Date;

  @Column({ nullable: true })
  phone: string;
}
