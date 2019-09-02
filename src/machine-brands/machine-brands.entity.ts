import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'machine_brands' })
export class MachineBrandsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  brand: string;
}
