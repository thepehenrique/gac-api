import { IsEnum, IsNotEmpty, IsString } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CursoEnum } from 'src/features/dominios/enum/curso.enum';
import { StatusEnum } from 'src/features/dominios/enum/status.enum';
import { TurnoEnum } from 'src/features/dominios/enum/turno.enum';
import { Usuario } from '../entities/usuario.entity';

export class AtualizarUsuarioDto {
  @ApiProperty({
    description: 'Nome',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  nome: string;

  @ApiProperty({
    description: 'Turno',
    required: true,
    enum: TurnoEnum,
  })
  @IsNotEmpty()
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
