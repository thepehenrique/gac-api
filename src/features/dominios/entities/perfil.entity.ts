import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'perfil' })
export class Perfil {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'Nome', nullable: true })
  nome: string;
}
