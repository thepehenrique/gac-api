import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Atividade } from '../entities/atividade.entity';
import { DominioRepository } from '../repository/dominio.repository';
import { Dimensao } from '../entities/dimensao.entity';

@Injectable()
export class DominioService {
  private readonly dominioRepository: DominioRepository;
  constructor(private readonly dataSource: DataSource) {
    this.dominioRepository = new DominioRepository(this.dataSource.manager);
  }

  async getAtividade(): Promise<Atividade[]> {
    return this.dominioRepository.getAtividade();
  }

  async getDimensao(): Promise<Dimensao[]> {
    return this.dominioRepository.getDimensao();
  }
}
