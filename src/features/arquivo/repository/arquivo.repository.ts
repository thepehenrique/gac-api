import { EntityManager, Repository } from 'typeorm';
import { Arquivo } from '../entities/arquivo.entity';
import { FiltroArquivoDto } from '../dtos/filtro-arquivo.dto';
import { Dimensao } from 'src/features/dominios/entities/dimensao.entity';
import { Atividade } from 'src/features/dominios/entities/atividade.entity';
import { SituacaoEnum } from '../enum/situacao.enum';

export class ArquivoRepository {
  protected readonly repository: Repository<Arquivo>;
  protected readonly repositoryDimensao: Repository<Dimensao>;
  protected readonly repositoryAtividade: Repository<Atividade>;

  constructor(entityManager: EntityManager) {
    this.repository = entityManager.getRepository(Arquivo);
    this.repositoryDimensao = entityManager.getRepository(Dimensao);
    this.repositoryAtividade = entityManager.getRepository(Atividade);
  }

  async save(arquivo: Arquivo): Promise<Arquivo> {
    return this.repository.save(arquivo);
  }

  async salvarArquivo(arquivo: Arquivo): Promise<Arquivo> {
    const novoArquivo = this.repository.create(arquivo);
    return await this.repository.save(novoArquivo);
  }

  async getAll(
    usuarioId: number,
    filtros: FiltroArquivoDto,
  ): Promise<{ content: Arquivo[]; total: number }> {
    const query = this.repository
      .createQueryBuilder('arquivo')
      .select([
        'arquivo.id',
        'arquivo.ano',
        'arquivo.horas',
        'arquivo.caminho_arquivo',
        'arquivo.horasAverbadas',
        'arquivo.observacao',
        'arquivo.dtCadastro',
        'arquivo.dtAtualizacao',
        'arquivo.situacao',
        'usuario.id',
        'usuario.nome',
        'atividade.id',
        'atividade.nome',
        'dimensao.id',
        'dimensao.nome',
      ])
      .innerJoin('arquivo.usuario', 'usuario')
      .innerJoin('arquivo.atividade', 'atividade')
      .innerJoin('atividade.dimensao', 'dimensao')
      .where('arquivo.usuarioId = :usuarioId', { usuarioId });

    if (filtros.atividadeId) {
      query.andWhere(`atividade.id = :atividadeId`, {
        atividadeId: filtros.atividadeId,
      });
    }

    if (filtros.dimensaoId) {
      query.andWhere(`atividade.dimensaoId = :dimensaoId`, {
        dimensaoId: filtros.dimensaoId,
      });
    }

    if (filtros.horasEnviadas) {
      query.andWhere(`arquivo.horas = :horas`, {
        horas: filtros.horasEnviadas,
      });
    }

    if (filtros.ano) {
      query.andWhere(`arquivo.ano = :ano`, {
        ano: filtros.ano,
      });
    }

    if (filtros.situacao) {
      query.andWhere(`arquivo.situacao = :situacao`, {
        situacao: filtros.situacao,
      });
    }

    if (filtros.pageSort && filtros.pageOrder) {
      query.orderBy(filtros.pageSort, filtros.pageOrder);
    } else {
      query.orderBy('arquivo.dtCadastro', 'DESC');
    }
    if (filtros.pageSize) {
      const skip = filtros.pageStart * filtros.pageSize;
      if (skip) {
        query.skip(skip);
      }
      if (filtros.pageSize) {
        query.take(filtros.pageSize);
      }
    }

    const [content, total] = await query.getManyAndCount();
    return { content, total };
  }

  async getAllArquivo(
    filtros: FiltroArquivoDto,
  ): Promise<{ content: Arquivo[]; total: number }> {
    const query = this.repository
      .createQueryBuilder('arquivo')
      .select([
        'arquivo.id',
        'arquivo.ano',
        'arquivo.horas',
        'arquivo.caminho_arquivo',
        'arquivo.horasAverbadas',
        'arquivo.observacao',
        'arquivo.dtCadastro',
        'arquivo.dtAtualizacao',
        'arquivo.situacao',
        'arquivo.caminho_arquivo',
        'usuario.id',
        'usuario.nome',
        'usuario.curso',
        'usuario.matricula',
        'atividade.id',
        'atividade.nome',
        'dimensao.id',
        'dimensao.nome',
      ])
      .innerJoin('arquivo.usuario', 'usuario')
      .innerJoin('arquivo.atividade', 'atividade')
      .innerJoin('atividade.dimensao', 'dimensao');

    if (filtros.dimensaoId) {
      query.andWhere(`atividade.dimensaoId = :dimensaoId`, {
        dimensaoId: filtros.dimensaoId,
      });
    }

    if (filtros.atividadeId) {
      query.andWhere(`atividade.id = :atividadeId`, {
        atividadeId: filtros.atividadeId,
      });
    }

    if (filtros.horasEnviadas) {
      query.andWhere(`arquivo.horas = :horas`, {
        horasEnviadas: filtros.horasEnviadas,
      });
    }

    if (filtros.situacao) {
      query.andWhere(`arquivo.situacao = :situacao`, {
        situacao: filtros.situacao,
      });
    }

    if (filtros.pageSort && filtros.pageOrder) {
      query.orderBy(filtros.pageSort, filtros.pageOrder);
    } else {
      query.orderBy('arquivo.dtCadastro', 'DESC');
    }
    if (filtros.pageSize) {
      const skip = filtros.pageStart * filtros.pageSize;
      if (skip) {
        query.skip(skip);
      }
      if (filtros.pageSize) {
        query.take(filtros.pageSize);
      }
    }

    const [content, total] = await query.getManyAndCount();
    return { content, total };
  }

  async getById(id: number): Promise<Arquivo> {
    return this.repository
      .createQueryBuilder('arquivo')
      .select([
        'arquivo.id',
        'arquivo.ano',
        'arquivo.horas',
        'arquivo.caminho_arquivo',
        'arquivo.horasAverbadas',
        'arquivo.observacao',
        'arquivo.dtCadastro',
        'arquivo.dtAtualizacao',
        'arquivo.situacao',
        'usuario.id',
        'usuario.nome',
        'atividade.id',
        'atividade.nome',
        'dimensao.id',
        'dimensao.nome',
      ])
      .innerJoin('arquivo.usuario', 'usuario')
      .innerJoin('arquivo.atividade', 'atividade')
      .innerJoin('atividade.dimensao', 'dimensao')
      .where('arquivo.id = :id', { id })
      .getOne();
  }

  async getAtividadePorId(atividadeId: number): Promise<Atividade> {
    return this.repositoryAtividade
      .createQueryBuilder('atividade')
      .leftJoinAndSelect('atividade.dimensao', 'dimensao')
      .where('atividade.id = :atividadeId', { atividadeId })
      .getOne();
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findOne(conditions: any): Promise<Arquivo | null> {
    return this.repository.findOne(conditions);
  }

  async getTotalHorasAverbadas(usuarioId: number): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('arquivo')
      .where('arquivo.usuarioId = :usuarioId', { usuarioId })
      .andWhere('arquivo.situacao = :situacao', {
        situacao: SituacaoEnum.APROVADO,
      })
      .select('SUM(arquivo.horasAverbadas)', 'total')
      .getRawOne();

    return result?.total || 0;
  }

  async getHorasAverbadasPorTipoAtividade(
    usuarioId: number,
    id: number,
  ): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('arquivo')
      .innerJoin('arquivo.atividade', 'atividade')
      .select('SUM(arquivo.horasAverbadas)', 'total')
      .where('arquivo.usuarioId = :usuarioId', { usuarioId })
      .andWhere('atividade.id = :id', {
        id,
      })
      .andWhere('arquivo.situacao = :situacao', {
        situacao: SituacaoEnum.APROVADO,
      })
      .getRawOne();

    return Number(result?.total) || 0;
  }

  async getTotalHorasAverbadasPorDimensao(
    usuarioId: number,
    dimensaoId: number,
  ): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('arquivo')
      .innerJoin('arquivo.atividade', 'atividade')
      .innerJoin('atividade.dimensao', 'dimensao')
      .select('SUM(arquivo.horasAverbadas)', 'total')
      .where('arquivo.usuarioId = :usuarioId', { usuarioId })
      .andWhere('dimensao.id = :dimensaoId', { dimensaoId })
      .andWhere('arquivo.situacao = :situacao', {
        situacao: SituacaoEnum.APROVADO,
      })
      .getRawOne();

    return Number(result?.total) || 0;
  }

  async getHorasPorAtividade(usuarioId: number) {
    const atividades = await this.repository
      .createQueryBuilder('arquivo')
      .innerJoin('arquivo.atividade', 'atividade')
      .innerJoin('atividade.dimensao', 'dimensao')
      .select('atividade.id', 'atividadeId')
      .addSelect('atividade.nome', 'atividadeNome')
      .addSelect('dimensao.nome', 'dimensaoNome')
      .addSelect('SUM(arquivo.horasAverbadas)', 'totalHoras')
      .where('arquivo.usuarioId = :usuarioId', { usuarioId })
      .andWhere('arquivo.situacao = :situacao', {
        situacao: SituacaoEnum.APROVADO,
      })
      .groupBy('atividade.id')
      .addGroupBy('dimensao.id')
      .getRawMany();

    // Garantir que o total de horas seja um número
    atividades.forEach((atividade) => {
      atividade.totalHoras = Number(atividade.totalHoras);
    });

    return atividades;
  }

  async getDimensaoAtividadeId(
    atividadeId: number,
    dimensaoId: number,
  ): Promise<Atividade> {
    return this.repositoryAtividade
      .createQueryBuilder('atividade')
      .where('atividade.id = :atividadeId', { atividadeId })
      .andWhere('atividade.dimensaoId = :dimensaoId', { dimensaoId })
      .getOne();
  }

  async getDimensaoAtividade(
    usuarioId: number,
    atividadeId: number,
    dimensaoId: number,
  ): Promise<Arquivo[]> {
    return this.repository
      .createQueryBuilder('arquivo')
      .where('arquivo.usuarioId = :usuarioId', { usuarioId })
      .andWhere('arquivo.atividadeId = :atividadeId', { atividadeId })
      .andWhere('arquivo.dimensaoId = :dimensaoId', { dimensaoId })

      .getMany();
  }

  async getDimensaoPorId(dimensaoId: number): Promise<Dimensao> {
    return this.repositoryDimensao
      .createQueryBuilder('dimensao')
      .where('dimensao.id = :dimensaoId', { dimensaoId })
      .getOne();
  }

  async buscarPorDimensao(
    usuarioId: number,
    dimensaoId: number,
  ): Promise<Arquivo[]> {
    return this.repository
      .createQueryBuilder('arquivo')
      .leftJoinAndSelect('arquivo.dimensao', 'dimensao')
      .leftJoinAndSelect('arquivo.atividade', 'atividade')
      .where('arquivo.usuarioId = :usuarioId', { usuarioId })
      .andWhere('arquivo.dimensaoId = :dimensaoId', { dimensaoId })
      .getMany();
  }

  async buscarPorDimensaoEAtividade(
    usuarioId: number,
    atividadeId: number,
    dimensaoId: number,
  ): Promise<Arquivo[]> {
    return this.repository
      .createQueryBuilder('arquivo')
      .leftJoinAndSelect('arquivo.dimensao', 'dimensao')
      .leftJoinAndSelect('arquivo.atividade', 'atividade')
      .where('arquivo.usuarioId = :usuarioId', { usuarioId })
      .andWhere('arquivo.dimensaoId = :dimensaoId', { dimensaoId })
      .andWhere('arquivo.atividadeId = :atividadeId', { atividadeId })
      .getMany();
  }
}
