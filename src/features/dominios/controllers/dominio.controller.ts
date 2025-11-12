import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { Atividade } from '../entities/atividade.entity';
import { DominioService } from '../services/dominio.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationQueryResponseDto } from 'src/commom/dto/pagination-query-response.dto';
import { FiltroArquivoDto } from 'src/features/arquivo/dtos/filtro-arquivo.dto';
import { Arquivo } from 'src/features/arquivo/entities/arquivo.entity';
import { ArquivoService } from 'src/features/arquivo/services/arquivo.service';
import { Dimensao } from '../entities/dimensao.entity';

@ApiTags('Dominio')
@Controller('dominio')
export class DominioController {
  constructor(
    private readonly dominioService: DominioService,
    private readonly arquivoService: ArquivoService,
  ) {}

  @Get('atividade')
  async getAtividade(): Promise<Atividade[]> {
    return this.dominioService.getAtividade();
  }

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
  @Get('arquivo')
  async getAll(
    @Query() filtros: FiltroArquivoDto,
  ): Promise<PaginationQueryResponseDto<Arquivo>> {
    return this.arquivoService.getAllArquivo(filtros);
  }
}
