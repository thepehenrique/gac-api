import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatusEnum } from 'src/features/dominios/enum/status.enum';
import { TipoUsuarioEnum } from 'src/features/dominios/enum/tipo-usuario.enum';
import { Usuario } from '../entities/usuario.entity';
import { FlagRegistroEnum } from 'src/features/dominios/enum/flag-registro.enum';
import { TipoGestorEnum } from '../enum/tipo-gestor.enum';

export class UsuarioDto {
  @ApiProperty({
    description: 'Identificador do Perfil',
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  idPerfil: number;

  @ApiProperty({
    description: 'Nome',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  nome: string;

  @ApiProperty({
    description: 'Email',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  @ValidateIf((o) => o.tipoUsuario !== TipoUsuarioEnum.ADMIN)
  email: string;

  @ApiProperty({
    description: 'Senha do Admin',
    required: false,
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.tipoUsuario === TipoUsuarioEnum.ADMIN)
  senha: string;

  @ApiProperty({
    description: 'Número de Matrícula',
    required: false,
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.tipoUsuario === TipoUsuarioEnum.ALUNO)
  matricula: string;

  @ApiProperty({
    description: 'Gestor',
    required: false,
    enum: FlagRegistroEnum,
  })
  @IsOptional()
  @IsEnum(FlagRegistroEnum)
  @ValidateIf((o) => o.tipoUsuario === TipoUsuarioEnum.PROFESSOR)
  gestor: FlagRegistroEnum;

  @ApiProperty({
    description: 'Tipo de Gestão',
    required: false,
    enum: TipoGestorEnum,
  })
  @IsOptional()
  @IsEnum(TipoGestorEnum)
  @ValidateIf((o) => o.tipoUsuario === TipoUsuarioEnum.PROFESSOR)
  tipoGestao: TipoGestorEnum;

  @ApiProperty({
    description: 'Situação do Registro',
    required: true,
    enum: StatusEnum,
  })
  @IsNotEmpty()
  @IsEnum(StatusEnum)
  status: StatusEnum;

  constructor(init?: Partial<UsuarioDto>) {
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
