import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'atividade' })
export class Atividade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'Nome', nullable: true })
  nome: string;
}
