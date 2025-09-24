import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/commom/dto/pagination-query.dto';
import { SituacaoEnum } from '../enum/situacao.enum';
import { CursoEnum } from 'src/features/usuario/enum/curso.enum';

const sortValues = [
  'usuario.nome',
  'usuario.curso',
  'usuario.matricula',
  'arquivo.ano',
  'arquivo.situacao',
  'arquivo.dtCadastro',
  'arquivo.horas',
  'arquivo.horasAverbadas',
  'atividade.nome', // <-- adicionado
  'dimensao.nome', // <-- adicionado
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
    description: 'Nome do aluno',
    required: false,
  })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiProperty({
    description: 'Matrícula do aluno',
    required: false,
  })
  @IsOptional()
  @IsString()
  matricula?: string;

  @ApiProperty({
    description: 'Curso',
    required: false,
    enum: CursoEnum,
  })
  @IsOptional()
  @IsEnum(CursoEnum)
  curso?: CursoEnum;

  @ApiProperty({
    description: 'Dimensão da atividade',
    required: false,
  })
  @IsOptional()
  @IsInt()
  idDimensao?: number;

  @ApiProperty({
    description: 'Atividade específica',
    required: false,
  })
  @IsOptional()
  @IsInt()
  idAtividade?: number;

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
