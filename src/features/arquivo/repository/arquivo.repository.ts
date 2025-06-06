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

  async createArquivo(arquivo: Arquivo): Promise<Arquivo> {
    const novoArquivo = this.repository.create(arquivo);
    return await this.repository.save(novoArquivo);
  }

  async getAll(
    idUsuario: number,
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
      .where('arquivo.idUsuario = :idUsuario', { idUsuario });

    /* if (filtros.idUsuario) {
      query.andWhere(`arquivo.idUsuario = :idUsuario`, {
        idUsuario: filtros.idUsuario,
      });
    } */

    if (filtros.curso) {
      query.andWhere(`usuario.curso = :curso`, {
        curso: filtros.curso,
      });
    }

    if (filtros.idDimensao) {
      query.andWhere(`atividade.idDimensao = :idDimensao`, {
        idDimensao: filtros.idDimensao,
      });
    }

    if (filtros.horasEnviadas) {
      query.andWhere(`arquivo.horas = :horas`, {
        horasEnviadas: filtros.horasEnviadas,
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

    /* if (filtros.idUsuario) {
      query.andWhere(`arquivo.idUsuario = :idUsuario`, {
        idUsuario: filtros.idUsuario,
      });
    } */

    if (filtros.curso) {
      query.andWhere(`usuario.curso = :curso`, {
        curso: filtros.curso,
      });
    }

    if (filtros.idDimensao) {
      query.andWhere(`atividade.idDimensao = :idDimensao`, {
        idDimensao: filtros.idDimensao,
      });
    }

    if (filtros.horasEnviadas) {
      query.andWhere(`arquivo.horas = :horas`, {
        horasEnviadas: filtros.horasEnviadas,
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

  /* async getAtividadeById(idAtividade: number): Promise<Atividade> {
    return this.repositoryAtividade.findOne({
      where: { id: idAtividade },
    });
  } */

  async getAtividadeById(id: number): Promise<Atividade | undefined> {
    return this.repositoryAtividade.findOne({
      where: { id },
      relations: ['dimensao'], // carrega a relação com a dimensão
    });
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findOne(conditions: any): Promise<Arquivo | null> {
    return this.repository.findOne(conditions);
  }

  async getTotalHorasAverbadas(idUsuario: number): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('arquivo')
      .where('arquivo.idUsuario = :idUsuario', { idUsuario })
      .andWhere('arquivo.situacao = :situacao', {
        situacao: SituacaoEnum.APROVADO,
      })
      .select('SUM(arquivo.horasAverbadas)', 'total')
      .getRawOne();

    return result?.total || 0;
  }

  async getHorasAverbadasPorTipoAtividade(
    idUsuario: number,
    id: number,
  ): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('arquivo')
      .innerJoin('arquivo.atividade', 'atividade')
      .select('SUM(arquivo.horasAverbadas)', 'total')
      .where('arquivo.idUsuario = :idUsuario', { idUsuario })
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
    idUsuario: number,
    idDimensao: number,
  ): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('arquivo')
      .innerJoin('arquivo.atividade', 'atividade')
      .innerJoin('atividade.dimensao', 'dimensao')
      .select('SUM(arquivo.horasAverbadas)', 'total')
      .where('arquivo.idUsuario = :idUsuario', { idUsuario })
      .andWhere('dimensao.id = :idDimensao', { idDimensao })
      .andWhere('arquivo.situacao = :situacao', {
        situacao: SituacaoEnum.APROVADO,
      })
      .getRawOne();

    return Number(result?.total) || 0;
  }

  async getHorasPorAtividade(idUsuario: number) {
    const atividades = await this.repository
      .createQueryBuilder('arquivo')
      .innerJoin('arquivo.atividade', 'atividade')
      .innerJoin('atividade.dimensao', 'dimensao')
      .select('atividade.id', 'atividadeId')
      .addSelect('atividade.nome', 'atividadeNome')
      .addSelect('dimensao.nome', 'dimensaoNome')
      .addSelect('SUM(arquivo.horasAverbadas)', 'totalHoras')
      .where('arquivo.idUsuario = :idUsuario', { idUsuario })
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
}
