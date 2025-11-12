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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ArquivoService } from '../services/arquivo.service';
import { Arquivo } from '../entities/arquivo.entity';
import { ArquivoDto } from '../dtos/arquivo.dto';
import { FiltroArquivoDto } from '../dtos/filtro-arquivo.dto';
import { PaginationQueryResponseDto } from 'src/commom/dto/pagination-query-response.dto';
import { AtualizarArquivoDto } from '../dtos/atualizar-arquivo.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Arquivo')
@Controller('arquivo')
export class ArquivoController {
  constructor(private readonly service: ArquivoService) {}

  @Post('/:usuarioId')
  @ApiOperation({ summary: 'Criação do registro + upload de arquivo PDF.' })
  @ApiParam({ name: 'usuarioId', type: Number })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Dados do arquivo + arquivo PDF',
    schema: {
      type: 'object',
      properties: {
        idAtividade: { type: 'number', example: 1 },
        idDimensao: { type: 'number', example: 1 },
        ano: { type: 'number', example: 2 },
        horas: { type: 'number', example: 5 },
        file: {
          type: 'string',
          format: 'binary',
        },
        observacao: {
          type: 'string',
        },
      },
      required: ['idAtividade', 'idDimensao', 'ano', 'horas', 'file'],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Arquivo salvo com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Requisição inválida.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário ou atividade não encontrada.',
  })
  @UseInterceptors(FileInterceptor('file'))
  async save(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Body() body: ArquivoDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<number> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado.');
    }

    return this.service.save(usuarioId, body, file);
  }

  /* @ApiResponse({
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
  } */

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
  @Get('/:usuarioId/arquivo')
  async getAll(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Query() filtros: FiltroArquivoDto,
  ): Promise<PaginationQueryResponseDto<Arquivo>> {
    return this.service.getAll(usuarioId, filtros);
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
  @Get('horas/:usuarioId')
  async getHorasTotais(@Param('usuarioId') usuarioId: number) {
    const result = await this.service.getHorasUsuario(usuarioId);
    return result;
  }

  /**
   * 🔹 Retorna todas as atividades dentro de uma dimensão, com totais
   * Exemplo: GET /arquivos/horas/dimensao/1/2
   * (usuarioId = 1, dimensaoId = 2)
   */
  @Get('horas/dimensao/:usuarioId/:dimensaoId')
  async getHorasPorDimensao(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Param('dimensaoId', ParseIntPipe) dimensaoId: number,
  ) {
    return this.service.getHorasPorDimensaoComTotal(usuarioId, dimensaoId);
  }

  /**
   * 🔹 Retorna as horas de uma atividade específica dentro de uma dimensão
   * Exemplo: GET /arquivos/horas/atividade/1/2/5
   * (usuarioId = 1, dimensaoId = 2, atividadeId = 5)
   */
  @Get('horas/atividade/:usuarioId/:dimensaoId/:atividadeId')
  async getHorasPorAtividade(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Param('dimensaoId', ParseIntPipe) dimensaoId: number,
    @Param('atividadeId', ParseIntPipe) atividadeId: number,
  ) {
    return this.service.getHoras(usuarioId, atividadeId, dimensaoId);
  }
}
