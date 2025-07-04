
import { ApiProperty } from '@nestjs/swagger';
import { Arquivo } from '../entities/arquivo.entity';
import { SituacaoEnum } from '../enum/situacao.enum';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsInt, IsOptional, MaxLength, IsString } from 'class-validator';

export class ArquivoDto {
  @ApiProperty({
    description: 'Identificador da Atividade',
    required: true,
  })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  idAtividade: number;

  @ApiProperty({
    description: 'Ano do Certificado',
    required: true,
  })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  ano: number;

  @ApiProperty({
    description: 'Horas do Certificado',
    required: true,
  })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  horas: number;

  @ApiProperty({
    description: 'Observação',
    required: false,
  })
  @IsOptional()
  @MaxLength(500)
  @IsString()
  observacao: string;

  /*  @ApiProperty({
    description: 'Caminho do arquivo',
    required: true,
  })
  @IsNotEmpty()
  @MaxLength(255)
  @IsString()
  caminho_arquivo: string;
 */
  constructor(init?: Partial<ArquivoDto>) {
    Object.assign(this, init);
  }

  asEntity(
    idUsuario: number,
    data: Date,
    entidadeReferencia: Arquivo,
  ): Arquivo {
    const entidade = entidadeReferencia;

    if (!entidade.id) {
      entidade.dtCadastro = data;
      entidade.situacao = SituacaoEnum.EM_ANALISE;
    }

    entidade.idUsuario = idUsuario;
    entidade.dtAtualizacao = data;

    Object.assign(entidade, {
      ...this,
    });

    return entidade;
  }
}
