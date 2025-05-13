import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Atividade } from './atividade.entity';

@Entity({ name: 'dimensao' })
export class Dimensao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nome', nullable: true })
  nome: string;

  @Column({ name: 'hora_total', nullable: true })
  horaTotal: number;

  @OneToMany(() => Atividade, (atividade) => atividade.dimensao)
  atividades: Atividade[];
}
