import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class UsersEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200, unique: true })
  username: string;

  @Column({ length: 300, select: false })
  password: string;

  @Column({ length: 200, nullable: true })
  email: string;

  @Column({ length: 50, name: 'first_name' })
  firstName: string;

  @Column({ length: 50, name: 'last_name' })
  lastName: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ default: false })
  disabled: boolean;
}
