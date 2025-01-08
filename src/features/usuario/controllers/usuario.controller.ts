import {
  Controller,
  HttpStatus,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Delete,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { Usuario } from '../entities/usuario.entity';
import { UsuarioService } from '../services/usuario.service';
import { UsuarioDto } from '../dtos/usuario.dto';
import { AtualizarUsuarioDto } from '../dtos/atualizar-usuario.dto';

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
  async save(@Body() body: UsuarioDto): Promise<number> {
    return this.service.save(body);
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
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AtualizarUsuarioDto,
  ): Promise<number> {
    return this.service.update(id, body);
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
    summary: 'Remove o registro pelo Id.',
  })
  @Delete('/:id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.delete(id);
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
  async getAll() // @Query() filtros: ,
  : Promise<Usuario[]> {
    return this.service.getAll();
  }
}
