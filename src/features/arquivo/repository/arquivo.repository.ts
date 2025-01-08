import { EntityManager, Repository } from 'typeorm';
import { Arquivo } from '../entities/arquivo.entity';

export class ArquivoRepository {
  protected readonly repository: Repository<Arquivo>;

  constructor(entityManager: EntityManager) {
    this.repository = entityManager.getRepository(Arquivo);
  }

  async save(pdf: Arquivo): Promise<Arquivo> {
    return this.repository.save(pdf);
  }

  async createArquivo(arquivo: Arquivo): Promise<Arquivo> {
    const novoArquivo = this.repository.create(arquivo);
    return await this.repository.save(novoArquivo);
  }

  async getAll(): Promise<Arquivo[]> {
    return this.repository.createQueryBuilder('item').getMany();
  }

  async getById(id: number): Promise<Arquivo> {
    return this.repository
      .createQueryBuilder('item')
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
