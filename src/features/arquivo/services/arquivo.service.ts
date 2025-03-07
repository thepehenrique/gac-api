import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ArquivoRepository } from '../repository/arquivo.repository';
import { DataSource } from 'typeorm';
import { ArquivoDto } from '../dtos/arquivo.dto';
import { Arquivo } from '../entities/arquivo.entity';
import { FiltroArquivoDto } from '../dtos/filtro-arquivo.dto';
import { PaginationQueryResponseDto } from 'src/commom/dto/pagination-query-response.dto';
import { TipoUsuarioEnum } from 'src/features/dominios/enum/tipo-usuario.enum';
import { UsuarioRepository } from 'src/features/usuario/repository/usuario.repository';
import { StatusEnum } from 'src/features/dominios/enum/status.enum';
import { AtualizarArquivoDto } from '../dtos/atualizar-arquivo.dto';
import { SituacaoEnum } from '../enum/situacao.enum';

@Injectable()
export class ArquivoService {
  private readonly repository: ArquivoRepository;
  private readonly usuarioRepository: UsuarioRepository;

  constructor(private readonly dataSource: DataSource) {
    this.repository = new ArquivoRepository(this.dataSource.manager);
    this.usuarioRepository = new UsuarioRepository(this.dataSource.manager);
  }

  async save(idUsuario: number, bodyDto: ArquivoDto): Promise<number> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: idUsuario, perfil: TipoUsuarioEnum.ALUNO },
    });

    if (!usuario) {
      throw new BadRequestException('Usuário não encontrado.');
    }

    if (usuario.status === StatusEnum.INATIVO) {
      throw new BadRequestException(
        'Usuário inativo. Não é permitido adicionar um arquivo.',
      );
    }

    if (usuario.idPerfil !== TipoUsuarioEnum.ALUNO) {
      throw new BadRequestException('O Usuário não é do Tipo Aluno.');
    }

    const data = new Date();
    const UsuarioEntity = new Arquivo();

    const registro = new ArquivoDto(bodyDto).asEntity(
      idUsuario,
      data,
      UsuarioEntity,
    );

    await this.repository.save(registro);

    return registro.id;
  }

  async update(id: number, bodyDto: ArquivoDto): Promise<number> {
    const data = new Date();
    const usuario = await this.getById(id);

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const registro = new ArquivoDto(bodyDto).asEntity(id, data, usuario);

    await this.repository.save(registro);

    return registro.id;
  }

  async updateArquivo(
    id: number,
    bodyDto: AtualizarArquivoDto,
  ): Promise<number> {
    const data = new Date();
    const arquivo = await this.getById(id);

    const horaMaximaAtividade = arquivo.atividade.horaTotal;
    const horaMaximaDimensao = arquivo.atividade.dimensao.horaTotal;

    const horasAtualmenteAverbadas =
      await this.repository.getTotalHorasAverbadas(arquivo.idUsuario);

    const horasAverbadasPorDimensao =
      await this.repository.getTotalHorasAverbadasPorDimensao(
        arquivo.idUsuario,
        arquivo.atividade.dimensao.id,
      );

    if (!arquivo) {
      throw new NotFoundException('Arquivo não encontrado.');
    }

    const horasAverbadasPorTipoAtividade =
      await this.repository.getHorasAverbadasPorTipoAtividade(
        arquivo.idUsuario,
        arquivo.atividade.id,
      );

    if (bodyDto.aprovado) {
      arquivo.horasAverbadas = bodyDto.horasAverbadas;
      arquivo.idSituacao = SituacaoEnum.APROVADO;
    } else {
      arquivo.observacao = bodyDto.observacao;
      arquivo.idSituacao = SituacaoEnum.RECUSADO;
    }

    if (bodyDto.aprovado && bodyDto.horasAverbadas === undefined) {
      throw new BadRequestException(
        'Se aprovado, o campo "horaAverbada" deve ser preenchido.',
      );
    }

    if (!bodyDto.aprovado && !bodyDto.observacao) {
      throw new BadRequestException(
        'Se recusado, o campo "observacao" deve ser preenchido.',
      );
    }

    if (
      horasAverbadasPorDimensao + bodyDto.horasAverbadas >
      horaMaximaDimensao
    ) {
      throw new BadRequestException(
        `A dimensão permite no máximo ${horaMaximaDimensao} horas. Atualmente, já existem ${horasAverbadasPorDimensao} horas aprovadas.`,
      );
    }

    if (bodyDto.horasAverbadas > horaMaximaAtividade) {
      throw new BadRequestException(
        `A atividade permite no máximo ${horaMaximaAtividade} horas. Ajuste o valor antes de validar.`,
      );
    }

    if (bodyDto.horasAverbadas > arquivo.horas) {
      throw new BadRequestException(
        `As horas averbadas não podem ser maior que as horas enviadas pelo aluno.`,
      );
    }

    if (
      horasAverbadasPorTipoAtividade + bodyDto.horasAverbadas >
      horaMaximaAtividade
    ) {
      throw new BadRequestException(
        `O tipo de atividade permite no máximo ${horaMaximaAtividade} horas. Atualmente, já existem ${horasAverbadasPorTipoAtividade} horas aprovadas.`,
      );
    }

    if (horasAtualmenteAverbadas > 100) {
      throw new BadRequestException(
        `A soma das horas averbadas não pode ultrapassar 100 horas. Atualmente, você tem ${horasAtualmenteAverbadas} horas aprovadas.`,
      );
    }

    const registro = new ArquivoDto(bodyDto).asEntity(id, data, arquivo);

    await this.repository.save(registro);

    return registro.id;
  }

  async getAll(
    filtros: FiltroArquivoDto,
  ): Promise<PaginationQueryResponseDto<Arquivo>> {
    const list = await this.repository.getAll(filtros);

    return {
      content: list.content,
      totalRecords: list.total,
      totalPages: Math.ceil(list.total / filtros.pageSize),
      currentPage: filtros.pageStart,
      pageSize: filtros.pageSize,
    };
  }

  async getById(id: number): Promise<Arquivo> {
    return this.repository.getById(id);
  }

  async delete(id: number): Promise<void> {
    const registro = await this.getById(id);
    if (!registro) throw new NotFoundException('Registro não encontrado.');

    try {
      await this.repository.delete(id);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new BadRequestException(
        'Ocorreu um erro ao tentar excluir os dados.',
      );
    }
  }
}
