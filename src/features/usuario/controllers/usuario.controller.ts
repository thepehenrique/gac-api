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
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { Usuario } from '../entities/usuario.entity';
import { UsuarioService } from '../services/usuario.service';
import { UsuarioDto } from '../dtos/usuario.dto';
import { FiltroUsuarioDto } from '../dtos/filtro-usuario.dto';
import { PaginationQueryResponseDto } from 'src/commom/dto/pagination-query-response.dto';
import { AtualizarUsuarioDto } from '../dtos/atualizar-usuario.dto';
import { StatusEnum } from 'src/features/dominios/enum/status.enum';

@ApiTags('Usuario')
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
  @Patch('/:id/desativar')
  async desativar(@Param('id', ParseIntPipe) id: number): Promise<Usuario> {
    return this.service.toggleStatus(id, StatusEnum.INATIVO);
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
  @Get()
  async getAll(
    @Query() filtros: FiltroUsuarioDto,
  ): Promise<PaginationQueryResponseDto<Usuario>> {
    return this.service.getAll(filtros);
  }
}
