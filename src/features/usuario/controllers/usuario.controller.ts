import {
  Controller,
  HttpStatus,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Usuario } from '../entities/usuario.entity';
import { UsuarioService } from '../services/usuario.service';
import { UsuarioDto } from '../dtos/usuario.dto';
import { FiltroUsuarioDto } from '../dtos/filtro-usuario.dto';
import { PaginationQueryResponseDto } from 'src/commom/dto/pagination-query-response.dto';
import { AtualizarUsuarioDto } from '../dtos/atualizar-usuario.dto';
import { StatusEnum } from 'src/features/dominios/enum/status.enum';
import { FlagRegistroEnum } from 'src/features/dominios/enum/flag-registro.enum';
import { JwtAuthGuard } from 'src/commom/guards/jwt-auth.guard';
import { RolesGuard } from 'src/commom/guards/roles.guard';
import { Roles } from 'src/commom/decorators/roles.decorator';
import { TipoUsuarioEnum } from 'src/features/dominios/enum/tipo-usuario.enum';

@ApiTags('Usuario')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly service: UsuarioService) {}

  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
  })
  @ApiOperation({
    summary: 'Criação do registro.',
  })
  @Roles(
    TipoUsuarioEnum.ADMIN,
    TipoUsuarioEnum.ALUNO,
    TipoUsuarioEnum.PROFESSOR,
  )
  @Post()
  async salvar(@Body() body: UsuarioDto): Promise<number> {
    const userId = await this.service.salvar(body);
    return userId;
  }

  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
  })
  @ApiOperation({
    summary: 'Atualização do registro.',
  })
  @Roles(
    TipoUsuarioEnum.ADMIN,
    TipoUsuarioEnum.ALUNO,
    TipoUsuarioEnum.PROFESSOR,
  )
  @Put(':id')
  async atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AtualizarUsuarioDto,
  ): Promise<number> {
    return this.service.atualizar(id, body);
  }

  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
  })
  @ApiOperation({
    summary: 'Busca do registro pelo Id.',
  })
  @Roles(
    TipoUsuarioEnum.ADMIN,
    TipoUsuarioEnum.ALUNO,
    TipoUsuarioEnum.PROFESSOR,
    TipoUsuarioEnum.PROFESSOR_GESTOR,
  )
  @Get('/:id')
  async getById(@Param('id', ParseIntPipe) id: number): Promise<Usuario> {
    return this.service.getById(id);
  }

  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
  })
  @ApiOperation({
    summary: 'Ativar (status) do registro.',
  })
  @Roles(TipoUsuarioEnum.ADMIN, TipoUsuarioEnum.PROFESSOR)
  @Patch('/:id/ativar')
  async ativar(@Param('id', ParseIntPipe) id: number): Promise<Usuario> {
    return this.service.toggleStatus(id, StatusEnum.ATIVO);
  }

  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
  })
  @ApiOperation({
    summary: 'Desativar (status) do registro.',
  })
  @Roles(TipoUsuarioEnum.ADMIN, TipoUsuarioEnum.PROFESSOR)
  @Patch('/:id/desativar')
  async desativar(@Param('id', ParseIntPipe) id: number): Promise<Usuario> {
    return this.service.toggleStatus(id, StatusEnum.INATIVO);
  }

  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
  })
  @ApiOperation({
    summary: 'Designar Gestor',
  })
  @Roles(TipoUsuarioEnum.ADMIN)
  @Patch('/:id/designar-gestor')
  async designarGestor(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Usuario> {
    return this.service.toggleGestor(id, FlagRegistroEnum.SIM);
  }

  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
  })
  @ApiOperation({
    summary: 'Remover Gestor',
  })
  @Roles(TipoUsuarioEnum.ADMIN)
  @Patch('/:id/remover-gestor')
  async removerGestor(@Param('id', ParseIntPipe) id: number): Promise<Usuario> {
    return this.service.toggleGestor(id, FlagRegistroEnum.NAO);
  }

  @ApiOperation({
    summary: 'Listagem dos registros cadastrados.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
  })
  @Roles(
    TipoUsuarioEnum.ADMIN,
    TipoUsuarioEnum.PROFESSOR,
    TipoUsuarioEnum.PROFESSOR_GESTOR,
  )
  @Get()
  async getAll(
    @Query() filtros: FiltroUsuarioDto,
  ): Promise<PaginationQueryResponseDto<Usuario>> {
    return this.service.getAll(filtros);
  }
}
