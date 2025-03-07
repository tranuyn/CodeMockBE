import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity() // This decorator tells TypeORM that this class represents a table in the database.
export class User {
  @PrimaryGeneratedColumn() // This decorator tells TypeORM that this column will be used as the primary key for this entity.
  id: number;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: true })
  phone: string;
}
