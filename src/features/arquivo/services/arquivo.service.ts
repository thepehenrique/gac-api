import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ArquivoRepository } from '../repository/arquivo.repository';
import { DataSource } from 'typeorm';
import { ArquivoDto } from '../dtos/arquivo.dto';
import { Arquivo } from '../entities/arquivo.entity';

@Injectable()
export class ArquivoService {
  private readonly repository: ArquivoRepository;

  constructor(private readonly dataSource: DataSource) {
    this.repository = new ArquivoRepository(this.dataSource.manager);
  }

  async save(bodyDto: ArquivoDto): Promise<number> {
    const data = new Date();
    const UsuarioEntity = new Arquivo();

    const registro = new ArquivoDto(bodyDto).asEntity(data, UsuarioEntity);

    await this.repository.save(registro);

    return registro.id;
  }

  async createArquivo(arquivo: Arquivo): Promise<Arquivo> {
    return await this.repository.createArquivo(arquivo);
  }

  /* async update(id: number, bodyDto: AtualizarUsuarioDto): Promise<number> {
    const data = new Date();
    const usuario = await this.getById(id);

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const registro = new AtualizarUsuarioDto(bodyDto).asEntity(data, usuario);

    await this.repository.save(registro);

    return registro.id;
  } */

  async getAll(): Promise<Arquivo[]> {
    return this.repository.getAll();
  }

  async getById(id: number): Promise<Arquivo> {
    return this.repository.getById(id);
  }

  async delete(id: number): Promise<void> {
    const registro = await this.getById(id);
    if (!registro) throw new NotFoundException('Registro não encontrado');

    try {
      await this.repository.delete(id);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new BadRequestException(
        'Ocorreu um erro ao tentar excluir os dados.',
      );
    }
  }
}
