import { EntityManager, Repository } from 'typeorm';
import { Arquivo } from '../entities/arquivo.entity';
import { FiltroArquivoDto } from '../dtos/filtro-arquivo.dto';

export class ArquivoRepository {
  protected readonly repository: Repository<Arquivo>;

  constructor(entityManager: EntityManager) {
    this.repository = entityManager.getRepository(Arquivo);
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
      .innerJoinAndSelect('item.modoComprovacao', 'modoComprovacao')
      .innerJoinAndSelect('item.atividade', 'atividade')
      .innerJoinAndSelect('item.dimensao', 'dimensao');
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
      query.andWhere(`item.idDimensao = :idDimensao`, {
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
      .innerJoinAndSelect('item.modoComprovacao', 'modoComprovacao')
      .innerJoinAndSelect('item.atividade', 'atividade')
      .innerJoinAndSelect('item.dimensao', 'dimensao')
      .where('item.id = :id', { id })
      .getOne();
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findOne(conditions: any): Promise<Arquivo | null> {
    return this.repository.findOne(conditions);
  }
}
