import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'machine_types' })
export class MachineTypesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  type: string;
}
