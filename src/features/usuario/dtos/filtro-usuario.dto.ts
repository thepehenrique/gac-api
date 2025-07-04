import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/commom/dto/pagination-query.dto';
import { StatusEnum } from 'src/features/dominios/enum/status.enum';
import { TipoUsuarioEnum } from 'src/features/dominios/enum/tipo-usuario.enum';

const sortValues = [
  'item.nome',
  'item.matricula',
  'item.idPerfil',
  'item.status',
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
  @IsInt()
  matricula: number;

  @ApiProperty({
    description: 'Perfil do Usuário',
    required: false,
    enum: TipoUsuarioEnum,
  })
  @IsOptional()
  @IsEnum(TipoUsuarioEnum)
  idPerfil: TipoUsuarioEnum;

  @ApiProperty({
    description: 'Situação do Registro',
    required: false,
    enum: StatusEnum,
  })
  @IsOptional()
  @IsEnum(StatusEnum)
  status: StatusEnum;
}
