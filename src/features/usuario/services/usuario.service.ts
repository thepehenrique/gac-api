import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsuarioRepository } from '../repository/usuario.repository';
import { DataSource } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { UsuarioDto } from '../dtos/usuario.dto';
import { AtualizarUsuarioDto } from '../dtos/atualizar-usuario.dto';

@Injectable()
export class UsuarioService {
  private readonly repository: UsuarioRepository;

  constructor(private readonly dataSource: DataSource) {
    this.repository = new UsuarioRepository(this.dataSource.manager);
  }

  async save(bodyDto: UsuarioDto): Promise<number> {
    const data = new Date();
    const UsuarioEntity = new Usuario();

    const registro = new UsuarioDto(bodyDto).asEntity(data, UsuarioEntity);

    await this.repository.save(registro);

    return registro.id;
  }

  async update(id: number, bodyDto: AtualizarUsuarioDto): Promise<number> {
    const data = new Date();
    const usuario = await this.getById(id);

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const registro = new AtualizarUsuarioDto(bodyDto).asEntity(data, usuario);

    await this.repository.save(registro);

    return registro.id;
  }

  async getAll(): Promise<Usuario[]> {
    return this.repository.getAll();
  }

  async getById(id: number): Promise<Usuario> {
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

  async getByEmail(email: string): Promise<Usuario | null> {
    return this.repository.findOne({ where: { email } });
  }
}
