import {
  Controller,
  HttpStatus,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { ArquivoService } from '../services/arquivo.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { diskStorage } from 'multer';
import { Arquivo } from '../entities/arquivo.entity';
import { ArquivoDto } from '../dtos/arquivo.dto';

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
  @Post()
  async save(@Body() body: ArquivoDto): Promise<number> {
    return this.service.save(body);
  }

  /* @ApiResponse({
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
  } */

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
  @Get()
  async getAll() // @Query() filtros: ,
  : Promise<Arquivo[]> {
    return this.service.getAll();
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(__dirname, '..', '..', 'uploads'), // Caminho onde os arquivos serão salvos
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}-${file.originalname}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(pdf)$/)) {
          return cb(new Error('Apenas arquivos PDF são permitidos!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Body() body: any,
  ): Promise<Arquivo> {
    const novoArquivo = new Arquivo();
    novoArquivo.idUsuario = body.idUsuario;
    novoArquivo.idModoComprovacao = body.idModoComprovacao;
    novoArquivo.idAtividade = body.idAtividade;
    novoArquivo.idDimensao = body.idDimensao;
    novoArquivo.ano = body.ano;
    novoArquivo.observacao = body.observacao || null;
    novoArquivo.status = body.status;
    novoArquivo.caminho_arquivo = file.path; // Caminho onde o arquivo foi salvo
    novoArquivo.dtCadastro = new Date();
    novoArquivo.dtAtualizacao = new Date();

    return await this.service.createArquivo(novoArquivo);
  }
}
