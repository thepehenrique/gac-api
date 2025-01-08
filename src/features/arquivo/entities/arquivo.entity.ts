import { StatusEnum } from 'src/features/dominios/enum/status.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'arquivo' })
export class Arquivo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'Identificador do Usuário', nullable: false })
  idUsuario: number;

  @Column({ name: 'Identificador do Modo de Comprovação', nullable: false })
  idModoComprovacao: number;

  @Column({ name: 'Identificador da Atividade', nullable: false })
  idAtividade: number;

  @Column({ name: 'Identificador da Dimensão', nullable: false })
  idDimensao: number;

  @Column({ name: 'Ano do Certificado', nullable: false })
  ano: number;

  @Column({ name: 'Observação', nullable: true })
  observacao: string;

  @Column({ name: 'Status do Registro', nullable: false })
  status: StatusEnum;

  @Column({ name: 'Caminho do arquivo', nullable: false })
  caminho_arquivo: string;

  @Column({ name: 'Data do Registro', nullable: false })
  dtCadastro: Date;

  @Column({ name: 'Data de Atualização do Registro', nullable: false })
  dtAtualizacao: Date;
}
