import {
  Length,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatusEnum } from 'src/features/dominios/enum/status.enum';
import { TipoUsuarioEnum } from 'src/features/dominios/enum/tipo-usuario.enum';
import { Usuario } from '../entities/usuario.entity';
import { FlagRegistroEnum } from 'src/features/dominios/enum/flag-registro.enum';

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
  @MaxLength(100)
  @IsString()
  nome: string;

  @ApiProperty({
    description: 'Número de Matrícula',
    required: true,
  })
  @IsString()
  @Length(13, 13)
  @IsNotEmpty()
  @ValidateIf((o) => o.tipoUsuario === TipoUsuarioEnum.ALUNO)
  matricula: string;

  @ApiProperty({
    description: 'Email',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @IsEmail()
  @ValidateIf((o) => o.tipoUsuario !== TipoUsuarioEnum.ADMIN)
  email: string;

  @ApiProperty({
    description: 'Senha do Admin',
    required: false,
  })
  @IsOptional()
  @MaxLength(255)
  @IsString()
  @ValidateIf((o) => o.tipoUsuario === TipoUsuarioEnum.ADMIN)
  senha: string;

  @ApiProperty({
    description: 'Indica se o usuário é gestor',
    required: false,
    enum: FlagRegistroEnum,
  })
  @IsOptional()
  @ValidateIf((o) => o.tipoUsuario === TipoUsuarioEnum.PROFESSOR)
  gestor?: FlagRegistroEnum;

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

  static fromEntity(usuario: Usuario): UsuarioDto {
    return new UsuarioDto({
      idPerfil: usuario.idPerfil,
      nome: usuario.nome,
      email: usuario.email,
      matricula: usuario.matricula,
      gestor: usuario.gestor,
    });
  }
}
