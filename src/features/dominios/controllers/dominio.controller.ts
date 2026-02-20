import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { Atividade } from '../entities/atividade.entity';
import { DominioService } from '../services/dominio.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationQueryResponseDto } from 'src/commom/dto/pagination-query-response.dto';
import { FiltroArquivoDto } from 'src/features/arquivo/dtos/filtro-arquivo.dto';
import { Arquivo } from 'src/features/arquivo/entities/arquivo.entity';
import { ArquivoService } from 'src/features/arquivo/services/arquivo.service';
import { Dimensao } from '../entities/dimensao.entity';
import { UsuarioService } from 'src/features/usuario/services/usuario.service';
import { Usuario } from 'src/features/usuario/entities/usuario.entity';
import { Roles } from 'src/commom/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/commom/guards/jwt-auth.guard';
import { RolesGuard } from 'src/commom/guards/roles.guard';
import { TipoUsuarioEnum } from '../enum/tipo-usuario.enum';

@ApiTags('Dominio')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dominio')
export class DominioController {
  constructor(
    private readonly dominioService: DominioService,
    private readonly arquivoService: ArquivoService,
    private readonly usuarioService: UsuarioService,
  ) {}

  @Roles(
    TipoUsuarioEnum.ADMIN,
    TipoUsuarioEnum.ALUNO,
    TipoUsuarioEnum.PROFESSOR,
    TipoUsuarioEnum.PROFESSOR_GESTOR,
  )
  @Get('atividade')
  async getAtividade(): Promise<Atividade[]> {
    return this.dominioService.getAtividade();
  }

  @Roles(
    TipoUsuarioEnum.ADMIN,
    TipoUsuarioEnum.ALUNO,
    TipoUsuarioEnum.PROFESSOR,
    TipoUsuarioEnum.PROFESSOR_GESTOR,
  )
  @Get('dimensao')
  async getDimensao(): Promise<Dimensao[]> {
    return this.dominioService.getDimensao();
  }

  @ApiOperation({
    summary: 'Listagem de todos os arquivos cadastrados.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
  })
  @Roles(
    TipoUsuarioEnum.ADMIN,
    TipoUsuarioEnum.ALUNO,
    TipoUsuarioEnum.PROFESSOR,
    TipoUsuarioEnum.PROFESSOR_GESTOR,
  )
  @Get('arquivo')
  async getAll(
    @Query() filtros: FiltroArquivoDto,
  ): Promise<PaginationQueryResponseDto<Arquivo>> {
    return this.arquivoService.getAllArquivo(filtros);
  }

  @ApiOperation({
    summary: 'Listagem de todos os professores cadastrados.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
  })
  @Roles(
    TipoUsuarioEnum.ADMIN,
    TipoUsuarioEnum.ALUNO,
    TipoUsuarioEnum.PROFESSOR,
    TipoUsuarioEnum.PROFESSOR_GESTOR,
  )
  @Get('usuario')
  async getAllProfessor(): Promise<Usuario[]> {
    return this.usuarioService.getAllProfessor();
  }

  @ApiOperation({
    summary: 'Listagem de todos os professores gestores cadastrados.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
  })
  @Roles(
    TipoUsuarioEnum.ADMIN,
    TipoUsuarioEnum.ALUNO,
    TipoUsuarioEnum.PROFESSOR,
    TipoUsuarioEnum.PROFESSOR_GESTOR,
  )
  @Get('usuario/gestor')
  async getAllProfessorGestor(): Promise<Usuario[]> {
    return this.usuarioService.getAllProfessorGestor();
  }
}
