import { EntityManager, Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { FiltroUsuarioDto } from '../dtos/filtro-usuario.dto';
import { TipoUsuarioEnum } from 'src/features/dominios/enum/tipo-usuario.enum';

export class UsuarioRepository {
  protected readonly repository: Repository<Usuario>;

  constructor(entityManager: EntityManager) {
    this.repository = entityManager.getRepository(Usuario);
  }

  async salvar(usuario: Usuario): Promise<Usuario> {
    return this.repository.save(usuario);
  }

  async getAll(
    filtros: FiltroUsuarioDto,
  ): Promise<{ content: Usuario[]; total: number }> {
    const query = this.repository.createQueryBuilder('item');

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

    if (filtros.perfil) {
      query.andWhere(`item.perfil = :perfil`, {
        perfil: filtros.perfil,
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
      .where('item.id = :id', { id })
      .getOne();
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async getUsuarioAluno(id: number): Promise<Usuario> {
    return this.repository
      .createQueryBuilder('item')
      .where('item.id = :id', { id })
      .andWhere('item.perfil = :perfil', { perfil: TipoUsuarioEnum.ALUNO })
      .getOne();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findOne(conditions: any): Promise<Usuario | null> {
    return this.repository.findOne(conditions);
  }
}
