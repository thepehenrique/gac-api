import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'modo-comprovacao' })
export class ModoComprovacao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nome', nullable: true })
  nome: string;
}
