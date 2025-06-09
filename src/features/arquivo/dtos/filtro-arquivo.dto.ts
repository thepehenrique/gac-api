import { IsIn, IsOptional } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt } from 'class-validator';
import { PaginationQueryDto } from 'src/commom/dto/pagination-query.dto';
import { SituacaoEnum } from '../enum/situacao.enum';
import { CursoEnum } from 'src/features/usuario/enum/curso.enum';

const sortValues = ['usuario.nome', 'usuario.curso', 'item.situacao'];

export class FiltroArquivoDto extends PaginationQueryDto {
  @ApiProperty({
    enum: sortValues,
  })
  @IsOptional()
  @IsIn(sortValues)
  pageSort: string;

  @ApiProperty({
    description: 'Curso',
    required: false,
    enum: CursoEnum,
  })
  @IsOptional()
  @IsEnum(CursoEnum)
  curso: CursoEnum;

  @ApiProperty({
    description: 'Tipo de Documento',
    required: false,
  })
  @IsOptional()
  @IsInt()
  idDimensao: number;

  @ApiProperty({
    description: 'Horas do Documento',
    required: false,
  })
  @IsOptional()
  @IsInt()
  horasEnviadas: number;

  /* @ApiProperty({
    description: 'Ano do Documento',
    required: false,
  })
  @IsOptional()
  @IsInt()
  ano: number; */

  @ApiProperty({
    description: 'Situação do Registro',
    required: false,
    enum: SituacaoEnum,
  })
  @IsOptional()
  @IsEnum(SituacaoEnum)
  situacao: SituacaoEnum;
}
