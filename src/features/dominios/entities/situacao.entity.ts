import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'situacao' })
export class Situacao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nome', nullable: true })
  nome: string;
}
