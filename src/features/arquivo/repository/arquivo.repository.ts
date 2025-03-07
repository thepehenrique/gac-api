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
    filtros: FiltroArquivoDto,
  ): Promise<{ content: Arquivo[]; total: number }> {
    const query = this.repository
      .createQueryBuilder('item')
      .innerJoinAndSelect('item.usuario', 'usuario')
      .innerJoinAndSelect('item.atividade', 'atividade')
      .innerJoinAndSelect('atividade.dimensao', 'dimensao');
    if (filtros.idUsuario) {
      query.andWhere(`item.idUsuario = :idUsuario`, {
        idUsuario: filtros.idUsuario,
      });
    }

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
      query.andWhere(`item.horas = :horas`, {
        horasEnviadas: filtros.horasEnviadas,
      });
    }

    if (filtros.ano) {
      query.andWhere(`item.ano = :ano`, {
        ano: filtros.ano,
      });
    }

    if (filtros.situacao) {
      query.andWhere(`item.situacao = :situacao`, {
        situacao: filtros.situacao,
      });
    }

    if (filtros.pageSort && filtros.pageOrder) {
      query.orderBy(filtros.pageSort, filtros.pageOrder);
    } else {
      query.orderBy('item.dtCadastro', 'DESC');
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
      .createQueryBuilder('item')
      .innerJoinAndSelect('item.usuario', 'usuario')
      .innerJoinAndSelect('item.atividade', 'atividade')
      .innerJoinAndSelect('atividade.dimensao', 'dimensao')
      .where('item.id = :id', { id })
      .getOne();
  }

  async getAtividadeById(idAtividade: number): Promise<Atividade> {
    return this.repositoryAtividade.findOne({
      where: { id: idAtividade },
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
      .andWhere('arquivo.idSituacao = :situacao', {
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
      .andWhere('arquivo.idSituacao = :situacao', {
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
      .andWhere('arquivo.idSituacao = :situacao', {
        situacao: SituacaoEnum.APROVADO,
      })
      .getRawOne();

    return Number(result?.total) || 0;
  }
}
