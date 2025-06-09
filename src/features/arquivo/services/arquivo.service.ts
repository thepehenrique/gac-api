import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ArquivoRepository } from '../repository/arquivo.repository';
import { DataSource } from 'typeorm';
import { ArquivoDto } from '../dtos/arquivo.dto';
import { Arquivo } from '../entities/arquivo.entity';
import { FiltroArquivoDto } from '../dtos/filtro-arquivo.dto';
import { PaginationQueryResponseDto } from 'src/commom/dto/pagination-query-response.dto';
import { TipoUsuarioEnum } from 'src/features/dominios/enum/tipo-usuario.enum';
import { UsuarioRepository } from 'src/features/usuario/repository/usuario.repository';
import { StatusEnum } from 'src/features/dominios/enum/status.enum';
import { AtualizarArquivoDto } from '../dtos/atualizar-arquivo.dto';
import { SituacaoEnum } from '../enum/situacao.enum';
import { createClient } from '@supabase/supabase-js';
import slugify from 'slugify';

@Injectable()
export class ArquivoService {
  private supabase;

  private readonly repository: ArquivoRepository;
  private readonly usuarioRepository: UsuarioRepository;

  constructor(private readonly dataSource: DataSource) {
    const supabaseURL = process.env.SUPABASE_URL;
    const supabaseKEY = process.env.SUPABASE_KEY;

    this.repository = new ArquivoRepository(this.dataSource.manager);
    this.usuarioRepository = new UsuarioRepository(this.dataSource.manager);
    this.supabase = createClient(supabaseURL, supabaseKEY);
  }

  compTotal = 100;

  async save(
    idUsuario: number,
    bodyDto: ArquivoDto,
    file: Express.Multer.File,
  ): Promise<number> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: idUsuario, perfil: TipoUsuarioEnum.ALUNO },
    });

    if (!usuario) {
      throw new BadRequestException('Usuário não encontrado.');
    }

    if (usuario.status === StatusEnum.INATIVO) {
      throw new BadRequestException(
        'Usuário inativo. Não é permitido adicionar um arquivo.',
      );
    }

    if (usuario.idPerfil !== TipoUsuarioEnum.ALUNO) {
      throw new BadRequestException('O Usuário não é do Tipo Aluno.');
    }

    const horasAtualmenteAverbadas =
      await this.repository.getTotalHorasAverbadas(idUsuario);

    if (horasAtualmenteAverbadas >= this.compTotal) {
      throw new BadRequestException(
        'Você já completou as horas complementares, não é permitido adicionar mais arquivos.',
      );
    }

    const atividade = await this.repository.getAtividadeById(
      bodyDto.idAtividade,
    );

    if (!atividade) {
      throw new BadRequestException('Atividade não encontrada.');
    }

    const totalHorasDimensao =
      await this.repository.getTotalHorasAverbadasPorDimensao(
        idUsuario,
        atividade.dimensao.id,
      );

    if (totalHorasDimensao + bodyDto.horas > atividade.dimensao.horaTotal) {
      throw new BadRequestException(
        `A dimensão "${atividade.dimensao.nome}" já atingiu seu limite de horas.`,
      );
    }

    const totalHorasAtividade =
      await this.repository.getHorasAverbadasPorTipoAtividade(
        idUsuario,
        bodyDto.idAtividade,
      );

    if (totalHorasAtividade + bodyDto.horas > atividade.horaTotal) {
      throw new BadRequestException(
        `A atividade "${atividade.nome}" já atingiu seu limite de horas.`,
      );
    }

    // ========== Upload do Arquivo ==========
    if (!file || file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Apenas arquivos PDF são permitidos.');
    }

    const supabaseURL = process.env.SUPABASE_URL;
    const supabaseKEY = process.env.SUPABASE_KEY;

    const supabase = createClient(supabaseURL, supabaseKEY, {
      auth: { persistSession: false },
    });

    const sanitizedFilename = slugify(file.originalname, {
      lower: true,
      remove: /[*+~.()'"!:@]/g,
    });

    const filePath = `uploads/${sanitizedFilename}`;

    const { data: existingFiles, error: listError } = await supabase.storage
      .from('gac-pdf')
      .list('uploads', { search: sanitizedFilename });

    if (listError) {
      throw new Error(
        `Erro ao verificar arquivos existentes: ${listError.message}`,
      );
    }

    if (existingFiles && existingFiles.length > 0) {
      throw new BadRequestException('Já existe um arquivo com este nome.');
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('gac-pdf')
      .upload(filePath, file.buffer, {
        upsert: false,
        contentType: 'application/pdf',
      });

    if (uploadError) {
      throw new Error(`Erro ao fazer upload: ${uploadError.message}`);
    }

    // ========== Salvar no Banco ==========
    const data = new Date();
    const registro = new ArquivoDto(bodyDto).asEntity(
      idUsuario,
      data,
      new Arquivo(),
    );

    // Salvando o caminho do arquivo
    registro.caminho_arquivo = uploadData.path;

    await this.repository.save(registro);

    return registro.id;
  }

  /* async save(idUsuario: number, bodyDto: ArquivoDto): Promise<number> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: idUsuario, perfil: TipoUsuarioEnum.ALUNO },
    });

    if (!usuario) {
      throw new BadRequestException('Usuário não encontrado.');
    }

    if (usuario.status === StatusEnum.INATIVO) {
      throw new BadRequestException(
        'Usuário inativo. Não é permitido adicionar um arquivo.',
      );
    }

    if (usuario.idPerfil !== TipoUsuarioEnum.ALUNO) {
      throw new BadRequestException('O Usuário não é do Tipo Aluno.');
    }

    const horasAtualmenteAverbadas =
      await this.repository.getTotalHorasAverbadas(idUsuario);

    if (horasAtualmenteAverbadas >= this.compTotal) {
      throw new BadRequestException(
        'Você já completou as horas complementares, não é permitido adicionar mais arquivos.',
      );
    }

    // Verificando o limite de horas na dimensão (não pode ultrapassar o limite da dimensão)
    const atividade = await this.repository.getAtividadeById(
      bodyDto.idAtividade,
    );

    if (!atividade) {
      throw new BadRequestException('Atividade não encontrada.');
    }

    const totalHorasDimensao =
      await this.repository.getTotalHorasAverbadasPorDimensao(
        idUsuario,
        atividade.dimensao.id,
      );

    if (totalHorasDimensao + bodyDto.horas > atividade.dimensao.horaTotal) {
      throw new BadRequestException(
        `A dimensão "${atividade.dimensao.nome}" já atingiu seu limite de horas.`,
      );
    }

    // Verificando o limite de horas da atividade
    const totalHorasAtividade =
      await this.repository.getHorasAverbadasPorTipoAtividade(
        idUsuario,
        bodyDto.idAtividade,
      );

    if (totalHorasAtividade + bodyDto.horas > atividade.horaTotal) {
      throw new BadRequestException(
        `A atividade "${atividade.nome}" já atingiu seu limite de horas.`,
      );
    }

    const data = new Date();

    const registro = new ArquivoDto(bodyDto).asEntity(
      idUsuario,
      data,
      new Arquivo(),
    );

    await this.repository.save(registro);

    return registro.id;
  } */

  async update(id: number, bodyDto: ArquivoDto): Promise<number> {
    const data = new Date();
    const usuario = await this.getById(id);

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const registro = new ArquivoDto(bodyDto).asEntity(id, data, usuario);

    await this.repository.save(registro);

    return registro.id;
  }

  async updateArquivo(
    id: number,
    bodyDto: AtualizarArquivoDto,
  ): Promise<number> {
    const data = new Date();
    const arquivo = await this.getById(id);

    if (!arquivo) {
      throw new NotFoundException('Arquivo não encontrado.');
    }

    const horaMaximaAtividade = arquivo.atividade.horaTotal;
    const horaMaximaDimensao = arquivo.atividade.dimensao.horaTotal;

    const horasAtualmenteAverbadas =
      await this.repository.getTotalHorasAverbadas(arquivo.idUsuario);

    const horasAverbadasPorDimensao =
      await this.repository.getTotalHorasAverbadasPorDimensao(
        arquivo.idUsuario,
        arquivo.atividade.dimensao.id,
      );

    const horasAverbadasPorTipoAtividade =
      await this.repository.getHorasAverbadasPorTipoAtividade(
        arquivo.idUsuario,
        arquivo.atividade.id,
      );

    if (bodyDto.aprovado) {
      arquivo.horasAverbadas = bodyDto.horasAverbadas;
      arquivo.situacao = SituacaoEnum.APROVADO;
    } else {
      arquivo.comentario = bodyDto.comentario;
      arquivo.situacao = SituacaoEnum.RECUSADO;
    }

    if (bodyDto.aprovado && bodyDto.horasAverbadas === undefined) {
      throw new BadRequestException(
        'Se aprovado, o campo "horaAverbada" deve ser preenchido.',
      );
    }

    if (!bodyDto.aprovado && !bodyDto.comentario) {
      throw new BadRequestException(
        'Se recusado, o campo "comentario" deve ser preenchido.',
      );
    }

    if (
      horasAverbadasPorDimensao + bodyDto.horasAverbadas >
      horaMaximaDimensao
    ) {
      throw new BadRequestException(
        `A dimensão permite no máximo ${horaMaximaDimensao} horas. Atualmente, já existem ${horasAverbadasPorDimensao} horas aprovadas.`,
      );
    }

    if (bodyDto.horasAverbadas > horaMaximaAtividade) {
      throw new BadRequestException(
        `A atividade permite no máximo ${horaMaximaAtividade} horas. Ajuste o valor antes de validar.`,
      );
    }

    if (bodyDto.horasAverbadas > arquivo.horas) {
      throw new BadRequestException(
        `As horas averbadas não podem ser maior que as horas enviadas pelo aluno.`,
      );
    }

    if (
      horasAverbadasPorTipoAtividade + bodyDto.horasAverbadas >
      horaMaximaAtividade
    ) {
      throw new BadRequestException(
        `O tipo de atividade permite no máximo ${horaMaximaAtividade} horas. Atualmente, já existem ${horasAverbadasPorTipoAtividade} horas aprovadas.`,
      );
    }

    if (horasAtualmenteAverbadas > this.compTotal) {
      throw new BadRequestException(
        `A soma das horas averbadas não pode ultrapassar 100 horas. Atualmente, você tem ${horasAtualmenteAverbadas} horas aprovadas.`,
      );
    }

    const registro = new ArquivoDto(bodyDto).asEntity(id, data, arquivo);

    await this.repository.save(registro);

    return registro.id;
  }

  async getAll(
    idUsuario: number,
    filtros: FiltroArquivoDto,
  ): Promise<PaginationQueryResponseDto<Arquivo>> {
    const list = await this.repository.getAll(idUsuario, filtros);

    return {
      content: list.content,
      totalRecords: list.total,
      totalPages: Math.ceil(list.total / filtros.pageSize),
      currentPage: filtros.pageStart,
      pageSize: filtros.pageSize,
    };
  }

  async getAllArquivo(
    filtros: FiltroArquivoDto,
  ): Promise<PaginationQueryResponseDto<Arquivo>> {
    const list = await this.repository.getAllArquivo(filtros);

    return {
      content: list.content,
      totalRecords: list.total,
      totalPages: Math.ceil(list.total / filtros.pageSize),
      currentPage: filtros.pageStart,
      pageSize: filtros.pageSize,
    };
  }

  async getById(id: number): Promise<Arquivo> {
    return this.repository.getById(id);
  }

  async delete(id: number): Promise<void> {
    const registro = await this.getById(id);
    if (!registro) throw new NotFoundException('Registro não encontrado.');

    try {
      await this.repository.delete(id);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new BadRequestException(
        'Ocorreu um erro ao tentar excluir os dados.',
      );
    }
  }

  async getHorasUsuario(idUsuario: number) {
    // Obtemos as atividades, dimensões e suas respectivas horas
    const atividades = await this.repository.getHorasPorAtividade(idUsuario);

    // Calculamos o total de horas
    let totalHoras = 0;
    atividades.forEach((atividade) => {
      totalHoras += atividade.totalHoras; // Soma das horas
    });

    // Verificamos se o usuário atingiu o limite de 100 horas
    const atingiuLimite = totalHoras >= this.compTotal;

    return {
      atividades,
      totalHoras,
      atingiuLimite,
    };
  }
}
