import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatusEnum } from 'src/features/dominios/enum/status.enum';
import { Arquivo } from '../entities/arquivo.entity';

export class ArquivoDto {
  @ApiProperty({
    description: 'Identificador do Usuário',
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  idUsuario: number;

  @ApiProperty({
    description: 'Identificador do Modo de Comprovação',
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  idModoComprovacao: number;

  @ApiProperty({
    description: 'Identificador da Atividade',
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  idAtividade: number;

  @ApiProperty({
    description: 'Identificador da Dimensão',
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  idDimensao: number;

  @ApiProperty({
    description: 'Ano do Certificado',
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  ano: number;

  @ApiProperty({
    description: 'Observação',
    required: false,
  })
  @IsOptional()
  @IsString()
  observacao: string;

  @ApiProperty({
    description: 'Situação do Registro',
    required: true,
    enum: StatusEnum,
  })
  @IsNotEmpty()
  @IsEnum(StatusEnum)
  status: StatusEnum;

  @ApiProperty({
    description: 'Caminho do arquivo',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  caminho_arquivo: string;

  constructor(init?: Partial<ArquivoDto>) {
    Object.assign(this, init);
  }

  asEntity(data: Date, entidadeReferencia: Arquivo): Arquivo {
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
