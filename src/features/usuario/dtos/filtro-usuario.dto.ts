import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/commom/dto/pagination-query.dto';
import { StatusEnum } from 'src/features/dominios/enum/status.enum';
import { TipoUsuarioEnum } from 'src/features/dominios/enum/tipo-usuario.enum';
import { TurnoEnum } from '../enum/turno.enum';
import { CursoEnum } from '../enum/curso.enum';

const sortValues = [
  'item.nome',
  'item.turno',
  'item.curso',
  'item.perfil',
  'item.matricula',
  'item.status',
  'item.dtCadastro',
];

export class FiltroUsuarioDto extends PaginationQueryDto {
  @ApiProperty({
    enum: sortValues,
  })
  @IsOptional()
  @IsIn(sortValues)
  pageSort: string;

  @ApiProperty({
    description: 'Nome do Usuário',
    required: false,
  })
  @IsOptional()
  @IsString()
  nome: string;

  @ApiProperty({
    description: 'Matrícula do Usuário Aluno',
    required: false,
  })
  @IsOptional()
  @IsString()
  matricula: string;

  @ApiProperty({
    description: 'Turno do Aluno',
    required: false,
    enum: TurnoEnum,
  })
  @IsOptional()
  @IsEnum(TurnoEnum)
  turno: TurnoEnum;

  @ApiProperty({
    description: 'Curso do Aluno',
    required: false,
    enum: CursoEnum,
  })
  @IsOptional()
  @IsEnum(CursoEnum)
  curso: CursoEnum;

  @ApiProperty({
    description: 'Perfil do Usuário',
    required: false,
    enum: TipoUsuarioEnum,
  })
  @IsOptional()
  @IsEnum(TipoUsuarioEnum)
  perfil: TipoUsuarioEnum;

  @ApiProperty({
    description: 'Situação do Registro',
    required: false,
    enum: StatusEnum,
  })
  @IsOptional()
  @IsEnum(StatusEnum)
  status: StatusEnum;
}
