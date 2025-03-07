import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'perfil' })
export class Perfil {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nome', nullable: true })
  nome: string;
}
