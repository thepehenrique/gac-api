
import { ApiProperty } from '@nestjs/swagger';
import { CursoEnum } from 'src/features/usuario/enum/curso.enum';
import { StatusEnum } from 'src/features/dominios/enum/status.enum';
import { TurnoEnum } from 'src/features/usuario/enum/turno.enum';
import { Usuario } from '../entities/usuario.entity';
import { FlagRegistroEnum } from 'src/features/dominios/enum/flag-registro.enum';
import { TipoGestorEnum } from '../enum/tipo-gestor.enum';
import { TipoUsuarioEnum } from 'src/features/dominios/enum/tipo-usuario.enum';
import { IsOptional, MaxLength, IsString, ValidateIf, IsEnum, IsNotEmpty } from 'class-validator';

export class AtualizarUsuarioDto {
  @ApiProperty({
    description: 'Nome',
    required: true,
  })
  @IsOptional()
  @MaxLength(100)
  @IsString()
  nome: string;

  @ApiProperty({
    description: 'Turno',
    required: true,
    enum: TurnoEnum,
  })
  @ValidateIf((o) => o.tipoUsuario !== TipoUsuarioEnum.ADMIN)
  @IsOptional()
  @IsEnum(TurnoEnum)
  turno: TurnoEnum;

  @ApiProperty({
    description: 'Curso',
    required: true,
    enum: CursoEnum,
  })
  @IsNotEmpty()
  @IsEnum(CursoEnum)
  curso: CursoEnum;

  @ApiProperty({
    description: 'Gestor',
    required: false,
    enum: FlagRegistroEnum,
  })
  @ValidateIf((o) => o.tipoUsuario === TipoUsuarioEnum.PROFESSOR)
  @IsOptional()
  @IsEnum(FlagRegistroEnum)
  gestor: FlagRegistroEnum;

  @ApiProperty({
    description: 'Tipo de Gestão',
    required: false,
    enum: TipoGestorEnum,
  })
  @ValidateIf((o) => o.tipoUsuario === TipoUsuarioEnum.PROFESSOR)
  @IsOptional()
  @IsEnum(TipoGestorEnum)
  tipoGestor: TipoGestorEnum;

  constructor(init?: Partial<AtualizarUsuarioDto>) {
    Object.assign(this, init);
  }

  asEntity(data: Date, entidadeReferencia: Usuario): Usuario {
    const entidade = entidadeReferencia;

    if (!entidade.id) {
      entidade.dtCadastro = data;
      entidade.status = StatusEnum.ATIVO;
    }

    entidade.dtAtualizacao = data;

    Object.assign(entidade, {
      ...this,
    });

    return entidade;
  }
}
