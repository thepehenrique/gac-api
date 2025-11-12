import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsInt, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/commom/dto/pagination-query.dto';
import { SituacaoEnum } from '../enum/situacao.enum';

const sortValues = [
  'arquivo.ano',
  'arquivo.situacao',
  'arquivo.dtCadastro',
  'arquivo.horas',
  'arquivo.horasAverbadas',
  'atividade.nome',
  'dimensao.nome',
];

export class FiltroArquivoDto extends PaginationQueryDto {
  @ApiProperty({
    enum: sortValues,
    required: false,
    description: 'Campo de ordenação',
  })
  @IsOptional()
  @IsIn(sortValues)
  pageSort: string;

  @ApiProperty({
    description: 'Dimensão da atividade',
    required: false,
  })
  @IsOptional()
  @IsInt()
  dimensaoId?: number;

  @ApiProperty({
    description: 'Atividade específica',
    required: false,
  })
  @IsOptional()
  @IsInt()
  atividadeId?: number;

  @ApiProperty({
    description: 'Horas enviadas no documento',
    required: false,
  })
  @IsOptional()
  @IsInt()
  horasEnviadas?: number;

  @ApiProperty({
    description: 'Ano do documento',
    required: false,
  })
  @IsOptional()
  @IsInt()
  ano?: number;

  @ApiProperty({
    description: 'Situação do registro',
    required: false,
    enum: SituacaoEnum,
  })
  @IsOptional()
  @IsEnum(SituacaoEnum)
  situacao?: SituacaoEnum;
}
