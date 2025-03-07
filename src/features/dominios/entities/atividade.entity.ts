import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Dimensao } from './dimensao.entity';

@Entity({ name: 'atividade' })
export class Atividade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nome', nullable: true })
  nome: string;

  @ManyToOne(() => Dimensao)
  @JoinColumn({ name: 'id_dimensao' })
  dimensao: Dimensao;

  @Column({ name: 'id_dimensao', nullable: true })
  idDimensao: number;

  @Column({ name: 'hora_total', nullable: true })
  horaTotal: number;
}
