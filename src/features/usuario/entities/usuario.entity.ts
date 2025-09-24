import { CursoEnum } from 'src/features/usuario/enum/curso.enum';
import { StatusEnum } from 'src/features/dominios/enum/status.enum';
import { TurnoEnum } from 'src/features/usuario/enum/turno.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FlagRegistroEnum } from 'src/features/dominios/enum/flag-registro.enum';
import { Perfil } from 'src/features/dominios/entities/perfil.entity';

@Entity({ name: 'usuario' })
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Perfil)
  @JoinColumn({ name: 'id_perfil' })
  perfil: Perfil;

  @Column({ name: 'id_perfil', nullable: false })
  idPerfil: number;

  @Column({ name: 'nome', nullable: false })
  nome: string;

  @Column({ name: 'matricula', nullable: true })
  matricula: string;

  @Column({ name: 'email', nullable: false })
  email: string;

  @Column({ name: 'turno', nullable: true })
  turno: TurnoEnum;

  @Column({ name: 'curso', nullable: true })
  curso: CursoEnum;

  @Column({ name: 'senha', nullable: true })
  senha: string;

  @Column({ name: 'status', nullable: false })
  status: StatusEnum;

  @Column({ name: 'gestor', nullable: true })
  gestor: FlagRegistroEnum;

  /*  @Column({ name: 'tipo_gestor', nullable: true })
  tipoGestor: TipoGestorEnum; */

  @Column({ name: 'dtCadastro', nullable: false })
  dtCadastro: Date;

  @Column({ name: 'dtAtualizacao', nullable: false })
  dtAtualizacao: Date;
}
