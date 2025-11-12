import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from 'src/features/usuario/entities/usuario.entity';
import { Atividade } from 'src/features/dominios/entities/atividade.entity';
import { SituacaoEnum } from '../enum/situacao.enum';
import { Dimensao } from 'src/features/dominios/entities/dimensao.entity';

@Entity({ name: 'arquivo' })
export class Arquivo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'situacao', nullable: false })
  situacao: SituacaoEnum;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ name: 'usuario_id', nullable: false })
  usuarioId: number;

  @ManyToOne(() => Atividade)
  @JoinColumn({ name: 'atividade_id' })
  atividade: Atividade;

  @Column({ name: 'atividade_id', nullable: false })
  atividadeId: number;

  @ManyToOne(() => Dimensao)
  @JoinColumn({ name: 'dimensao_id' })
  dimensao: Dimensao;

  @Column({ name: 'dimensao_id', nullable: false })
  dimensaoId: number;

  @Column({ name: 'ano', nullable: false })
  ano: number;

  @Column({ name: 'caminho_do_arquivo', nullable: false })
  caminho_arquivo: string;

  @Column({ name: 'horas', nullable: false })
  horas: number;

  @Column({ name: 'horas_averbadas', nullable: true })
  horasAverbadas: number;

  @Column({ name: 'observacao', nullable: true })
  observacao: string;

  @Column({ name: 'comentario', nullable: true })
  comentario: string;

  @Column({ name: 'dtCadastro', nullable: false })
  dtCadastro: Date;

  @Column({ name: 'dtAtualizacao', nullable: false })
  dtAtualizacao: Date;
}
