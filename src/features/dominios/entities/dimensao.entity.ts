import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'dimensao' })
export class Dimensao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'Nome', nullable: true })
  nome: string;
}
