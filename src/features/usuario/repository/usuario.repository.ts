import { EntityManager, Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { FiltroUsuarioDto } from '../dtos/filtro-usuario.dto';

export class UsuarioRepository {
  protected readonly repository: Repository<Usuario>;

  constructor(entityManager: EntityManager) {
    this.repository = entityManager.getRepository(Usuario);
  }

  async save(usuario: Usuario): Promise<Usuario> {
    return this.repository.save(usuario);
  }

  async getAll(
    filtros: FiltroUsuarioDto,
  ): Promise<{ content: Usuario[]; total: number }> {
    const query = this.repository
      .createQueryBuilder('item')
      .innerJoinAndSelect('item.perfil', 'perfil');

    if (filtros.nome) {
      query.andWhere(`item.nome LIKE :nome`, {
        nome: `%${filtros.nome}%`,
      });
    }

    if (filtros.matricula) {
      query.andWhere(`item.matricula LIKE :matricula`, {
        matricula: `%${filtros.matricula}%`,
      });
    }

    if (filtros.idPerfil) {
      query.andWhere(`item.idPerfil = :idPerfil`, {
        idPerfil: filtros.idPerfil,
      });
    }

    if (filtros.status) {
      query.andWhere(`item.status = :status`, {
        status: filtros.status,
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

  async getById(id: number): Promise<Usuario> {
    return this.repository
      .createQueryBuilder('item')
      .innerJoinAndSelect('item.perfil', 'perfil')
      .where('item.id = :id', { id })
      .getOne();
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findOne(conditions: any): Promise<Usuario | null> {
    return this.repository.findOne(conditions);
  }
}
