import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNotEmpty,
  ValidateIf,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Arquivo } from '../entities/arquivo.entity';

export class AtualizarArquivoDto {
  @ApiProperty({
    description: 'Define se o arquivo foi aprovado',
    required: true,
  })
  @IsBoolean()
  aprovado: boolean;

  @ApiProperty({
    description: 'Observação do gestor',
    required: false,
  })
  @ValidateIf((obj) => obj.aprovado === false)
  @IsNotEmpty({
    message: 'O comentário é obrigatório quando o arquivo é recusado.',
  })
  @IsString()
  comentario?: string;

  @ApiProperty({
    description: 'Horas averbadas pelo gestor',
    required: false,
  })
  @ValidateIf((obj) => obj.aprovado === true)
  @Type(() => Number)
  @IsNumber()
  @Min(1, {
    message: 'As horas devem ser maiores que zero.',
  })
  horasAverbadas?: number;

  constructor(init?: Partial<AtualizarArquivoDto>) {
    Object.assign(this, init);
  }

  asEntity(
    usuarioId: number,
    data: Date,
    entidadeReferencia: Arquivo,
  ): Arquivo {
    const entidade = entidadeReferencia;

    if (!entidade.id) {
      entidade.dtCadastro = data;
    }

    entidade.usuarioId = usuarioId;
    entidade.dtAtualizacao = data;

    Object.assign(entidade, {
      comentario: this.comentario,
      horasAverbadas: this.horasAverbadas,
    });

    return entidade;
  }
}
