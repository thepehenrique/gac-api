import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SituacaoEnum } from '../enum/situacao.enum';
import { Usuario } from 'src/features/usuario/entities/usuario.entity';
import { ModoComprovacao } from 'src/features/dominios/entities/modo-comprovacao.entity';
import { Atividade } from 'src/features/dominios/entities/atividade.entity';
import { Dimensao } from 'src/features/dominios/entities/dimensao.entity';

@Entity({ name: 'arquivo' })
export class Arquivo {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'Identificador do Usuario' })
  usuario: Usuario;

  @Column({ name: 'Identificador do Usuario', nullable: false })
  idUsuario: number;

  @ManyToOne(() => ModoComprovacao)
  @JoinColumn({ name: 'Identificador do Modo de Comprovação' })
  modoComprovacao: ModoComprovacao;

  @Column({ name: 'Identificador do Modo de Comprovação', nullable: false })
  idModoComprovacao: number;

  @ManyToOne(() => Atividade)
  @JoinColumn({ name: 'Identificador da Atividade' })
  atividade: Atividade;

  @Column({ name: 'Identificador da Atividade', nullable: false })
  idAtividade: number;

  @ManyToOne(() => Dimensao)
  @JoinColumn({ name: 'Identificador da Dimensão' })
  dimensao: Dimensao;

  @Column({ name: 'Identificador da Dimensão', nullable: false })
  idDimensao: number;

  @Column({ name: 'Ano do Certificado', nullable: false })
  ano: number;

  @Column({ name: 'Horas do Documento', nullable: false })
  horas: number;

  @Column({ name: 'Observação', nullable: true })
  observacao: string;

  @Column({ name: 'Situação do Registro', nullable: false })
  situacao: SituacaoEnum;

  @Column({ name: 'Caminho do arquivo', nullable: false })
  caminho_arquivo: string;

  @Column({ name: 'Data do Registro', nullable: false })
  dtCadastro: Date;

  @Column({ name: 'Data de Atualização do Registro', nullable: false })
  dtAtualizacao: Date;
}
