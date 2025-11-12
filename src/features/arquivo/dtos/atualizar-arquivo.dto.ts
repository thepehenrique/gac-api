import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNotEmpty,
  ValidateIf,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { SituacaoEnum } from '../enum/situacao.enum';
import { Arquivo } from '../entities/arquivo.entity';

export class AtualizarArquivoDto {
  @ApiProperty({
    description: 'status',
    required: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  aprovado: boolean;

  @ApiProperty({
    description: 'Observação',
    required: false,
  })
  @IsOptional()
  @IsString()
  @ValidateIf((obj) => obj.situacao === SituacaoEnum.RECUSADO)
  @IsNotEmpty({
    message: 'O comentario é obrigatória quando o arquivo é reprovado',
  })
  comentario: string;

  @ApiProperty({
    description: 'Horas Averbadas',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @ValidateIf((obj) => obj.situacao === SituacaoEnum.APROVADO)
  @IsNotEmpty({
    message: 'O campo horasAverbadas é obrigatório quando o arquivo é aprovado',
  })
  horasAverbadas: number;

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
      ...this,
    });

    return entidade;
  }
}
