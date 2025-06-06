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

@Entity({ name: 'arquivo' })
export class Arquivo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'situacao', nullable: false })
  situacao: SituacaoEnum;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @Column({ name: 'id_usuario', nullable: false })
  idUsuario: number;

  @ManyToOne(() => Atividade)
  @JoinColumn({ name: 'id_atividade' })
  atividade: Atividade;

  @Column({ name: 'id_atividade', nullable: false })
  idAtividade: number;

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

  @Column({ name: 'dtCadastro', nullable: false })
  dtCadastro: Date;

  @Column({ name: 'dtAtualizacao', nullable: false })
  dtAtualizacao: Date;
}
