import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Atividade } from '../entities/atividade.entity';

@Injectable()
export class DominioService {
  constructor(private readonly dataSource: DataSource) {}

  async getAtividade(): Promise<Atividade[]> {
    return this.dataSource
      .getRepository(Atividade)
      .createQueryBuilder('item')
      .orderBy('item.id', 'ASC')
      .getMany();
  }
}
