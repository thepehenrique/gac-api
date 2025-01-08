import { CursoEnum } from 'src/features/dominios/enum/curso.enum';
import { StatusEnum } from 'src/features/dominios/enum/status.enum';
import { TurnoEnum } from 'src/features/dominios/enum/turno.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'usuario' })
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'Identificador do Perfil', nullable: false })
  idPerfil: number;

  @Column({ name: 'Nome', nullable: false })
  nome: string;

  @Column({ name: 'Email Institucional', nullable: false })
  email: string;

  @Column({ name: 'Senha do Admin', nullable: true })
  senha: string;

  @Column({ name: 'Número de matrícula do aluno', nullable: true })
  matricula: string;

  @Column({ name: 'Turno do aluno', nullable: true })
  turno: TurnoEnum;

  @Column({ name: 'Curso do aluno', nullable: true })
  curso: CursoEnum;

  @Column({ name: 'Status do Registro', nullable: false })
  status: StatusEnum;

  @Column({ name: 'Data do Registro', nullable: false })
  dtCadastro: Date;

  @Column({ name: 'Data de Atualização do Registro', nullable: false })
  dtAtualizacao: Date;
}
