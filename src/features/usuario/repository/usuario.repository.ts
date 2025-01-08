import { EntityManager, Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';

export class UsuarioRepository {
  protected readonly repository: Repository<Usuario>;

  constructor(entityManager: EntityManager) {
    this.repository = entityManager.getRepository(Usuario);
  }

  async save(usuario: Usuario): Promise<Usuario> {
    return this.repository.save(usuario);
  }

  async getAll(): Promise<Usuario[]> {
    return this.repository.createQueryBuilder('item').getMany();
  }

  async getById(id: number): Promise<Usuario> {
    return this.repository
      .createQueryBuilder('item')
      .select([
        'item.id',
        'item.idPerfil',
        'item.nome',
        'item.email',
        'item.senha',
        'item.matricula',
        'item.turno',
        'item.curso',
        'item.status',
        'item.dtCadastro',
        'item.dtAtualizacao',
      ])
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
