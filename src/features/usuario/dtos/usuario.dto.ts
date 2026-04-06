import {
  Length,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatusEnum } from 'src/features/dominios/enum/status.enum';
import { TipoUsuarioEnum } from 'src/features/dominios/enum/tipo-usuario.enum';
import { Usuario } from '../entities/usuario.entity';
import { FlagRegistroEnum } from 'src/features/dominios/enum/flag-registro.enum';
import { CursoEnum } from '../enum/curso.enum';

export class UsuarioDto {
  @ApiProperty({
    description: 'ID do usuário',
    required: false,
  })
  id?: number;

  @ApiProperty({
    description: 'Identificador do Perfil',
    required: true,
    enum: TipoUsuarioEnum,
  })
  @IsNotEmpty()
  @IsEnum(TipoUsuarioEnum)
  perfil: TipoUsuarioEnum;

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
    required: false,
  })
  @IsString()
  @Length(11, 13)
  @IsOptional()
  @ValidateIf((o) => o.perfil === TipoUsuarioEnum.ALUNO)
  matricula: string;

  @ApiProperty({
    description: 'Ano de Ingresso',
    required: false,
  })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.perfil === TipoUsuarioEnum.ALUNO)
  anoIngresso: string;

  @ApiProperty({
    description: 'Semestre de Ingresso',
    required: false,
  })
  @IsString()
  @IsOptional()
  @ValidateIf((o) => o.perfil === TipoUsuarioEnum.ALUNO)
  semestreIngresso: string;

  @ApiProperty({
    description: 'Curso',
    required: false,
    enum: CursoEnum,
  })
  @IsOptional()
  @ValidateIf((o) => o.perfil !== TipoUsuarioEnum.ADMIN)
  curso?: CursoEnum;

  @ApiProperty({
    description: 'Email',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @IsEmail()
  @ValidateIf((o) => o.perfil !== TipoUsuarioEnum.ADMIN)
  email: string;

  @ApiProperty({
    description: 'Senha do Admin',
    required: false,
  })
  @IsOptional()
  @MaxLength(255)
  @IsString()
  @ValidateIf((o) => o.perfil === TipoUsuarioEnum.ADMIN)
  senha: string;

  @ApiProperty({
    description: 'Indica se o usuário é gestor',
    required: false,
    enum: FlagRegistroEnum,
  })
  @IsOptional()
  @ValidateIf((o) => o.perfil === TipoUsuarioEnum.PROFESSOR)
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
      id: usuario.id,
      perfil: usuario.perfil,
      nome: usuario.nome,
      email: usuario.email,
      matricula: usuario.matricula,
      gestor: usuario.gestor,
    });
  }
}
