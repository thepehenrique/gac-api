import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'dimensao' })
export class Dimensao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nome', nullable: true })
  nome: string;

  @Column({ name: 'hora_total', nullable: true })
  horaTotal: number;
}
