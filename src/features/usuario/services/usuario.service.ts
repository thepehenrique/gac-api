import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsuarioRepository } from '../repository/usuario.repository';
import { DataSource } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { UsuarioDto } from '../dtos/usuario.dto';
import { FiltroUsuarioDto } from '../dtos/filtro-usuario.dto';
import { PaginationQueryResponseDto } from 'src/commom/dto/pagination-query-response.dto';
import { AtualizarUsuarioDto } from '../dtos/atualizar-usuario.dto';
import { StatusEnum } from 'src/features/dominios/enum/status.enum';
import { FlagRegistroEnum } from 'src/features/dominios/enum/flag-registro.enum';

@Injectable()
export class UsuarioService {
  private readonly repository: UsuarioRepository;

  constructor(private readonly dataSource: DataSource) {
    this.repository = new UsuarioRepository(this.dataSource.manager);
  }

  async salvar(bodyDto: UsuarioDto): Promise<number> {
    const data = new Date();
    const usuarioEntidade = new Usuario();

    const registro = new UsuarioDto(bodyDto).asEntity(data, usuarioEntidade);

    if (bodyDto.matricula && bodyDto.matricula.length !== 13) {
      throw new BadRequestException(
        'A matrícula deve ter exatamente 13 caracteres.',
      );
    }

    /* if (bodyDto.idPerfil === 1) {
      if (!bodyDto.senha) {
        throw new BadRequestException('Administradores devem ter uma senha.');
      }

      const salt = await bcrypt.genSalt(10);
      registro.senha = await bcrypt.hash(bodyDto.senha, salt);
    } else {
      registro.senha = null;
    } */
    await this.repository.salvar(registro);

    return registro.id;
  }

  async atualizar(id: number, bodyDto: AtualizarUsuarioDto): Promise<number> {
    const data = new Date();
    const usuario = await this.getById(id);

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    /*  if (bodyDto.gestor === FlagRegistroEnum.SIM && !bodyDto.tipoGestor) {
      throw new BadRequestException(
        'O campo tipoGestao é obrigatório para professores que são gestores.',
      );
    } 

     if (bodyDto.tipoGestor === TipoGestorEnum.RESPONSAVEL) {
      const professorResponsavel = await this.repository.findOne({
        where: {
          tipoGestor: TipoGestorEnum.RESPONSAVEL,
          gestor: FlagRegistroEnum.SIM,
        },
      });

      if (professorResponsavel && professorResponsavel.id !== id) {
        professorResponsavel.gestor = FlagRegistroEnum.NAO;
        await this.repository.save(professorResponsavel);
      }
    } */

    const registro = new AtualizarUsuarioDto(bodyDto).asEntity(data, usuario);

    await this.repository.salvar(registro);

    return registro.id;
  }

  async getAll(
    filtros: FiltroUsuarioDto,
  ): Promise<PaginationQueryResponseDto<Usuario>> {
    const list = await this.repository.getAll(filtros);

    return {
      content: list.content,
      totalRecords: list.total,
      totalPages: Math.ceil(list.total / filtros.pageSize),
      currentPage: filtros.pageStart,
      pageSize: filtros.pageSize,
    };
  }

  async getById(id: number): Promise<Usuario> {
    return this.repository.getById(id);
  }

  async getAllProfessor(): Promise<Usuario[]> {
    return this.repository.getAllProfessor();
  }

  async toggleStatus(id: number, status: StatusEnum): Promise<Usuario> {
    const entity = await this.getById(id);
    if (!entity) {
      throw new NotFoundException('Registro não encontrado.');
    }
    entity.status = status;
    entity.dtAtualizacao = new Date();

    const registro = await this.repository.salvar(entity);

    return registro;
  }

  async toggleGestor(id: number, gestor: FlagRegistroEnum): Promise<Usuario> {
    const entity = await this.getById(id);
    if (!entity) {
      throw new NotFoundException('Registro não encontrado.');
    }
    entity.gestor = gestor;
    entity.dtAtualizacao = new Date();

    const registro = await this.repository.salvar(entity);

    return registro;
  }

  async getByEmail(email: string): Promise<Usuario | null> {
    return this.repository.findOne({ where: { email } });
  }
}
