import {
  Controller,
  HttpStatus,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { ArquivoService } from '../services/arquivo.service';
import { Arquivo } from '../entities/arquivo.entity';
import { ArquivoDto } from '../dtos/arquivo.dto';
import { FiltroArquivoDto } from '../dtos/filtro-arquivo.dto';
import { PaginationQueryResponseDto } from 'src/commom/dto/pagination-query-response.dto';
import { AtualizarArquivoDto } from '../dtos/atualizar-arquivo.dto';

@ApiTags('Arquivo')
@Controller('arquivo')
export class ArquivoController {
  constructor(private readonly service: ArquivoService) {}

  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
  })
  @ApiOperation({
    summary: 'Criação do registro.',
  })
  @Post('/:idUsuario')
  async save(
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
    @Body() body: ArquivoDto,
  ): Promise<number> {
    return this.service.save(idUsuario, body);
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
    @Param('idUsuario', ParseIntPipe) id: number,
    @Body() body: ArquivoDto,
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
    summary: 'Aprovar ou Recusar.',
  })
  @Put(':id/situacao')
  async updateArquivo(
    @Param('id', ParseIntPipe) id: number,
    @Body() bodyDto: AtualizarArquivoDto,
  ): Promise<number> {
    return this.service.updateArquivo(id, bodyDto);
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
  async getById(@Param('id', ParseIntPipe) id: number): Promise<Arquivo> {
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
  @Get('/:idUsuario/arquivo')
  async getAll(
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
    @Query() filtros: FiltroArquivoDto,
  ): Promise<PaginationQueryResponseDto<Arquivo>> {
    return this.service.getAll(idUsuario, filtros);
  }

  @ApiOperation({
    summary: 'Quantidade de horas.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
  })
  @Get('horas/:idUsuario')
  async getHorasTotais(@Param('idUsuario') idUsuario: number) {
    const result = await this.service.getHorasUsuario(idUsuario);
    return result;
  }
}
