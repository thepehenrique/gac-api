import { Repository, EntityManager } from 'typeorm';
import { Atividade } from '../entities/atividade.entity';
import { Dimensao } from '../entities/dimensao.entity';

export class DominioRepository {
  protected readonly atividadeRepository: Repository<Atividade>;
  protected readonly dimensaoRepository: Repository<Dimensao>;

  constructor(entityManager: EntityManager) {
    this.atividadeRepository = entityManager.getRepository(Atividade);
    this.dimensaoRepository = entityManager.getRepository(Dimensao);
  }

  async getAtividade(): Promise<Atividade[]> {
    return this.atividadeRepository.createQueryBuilder('item').getMany();
  }

  async getDimensao(): Promise<Dimensao[]> {
    return this.dimensaoRepository.createQueryBuilder('item').getMany();
  }
}
