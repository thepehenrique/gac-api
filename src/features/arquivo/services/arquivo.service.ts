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
import { UploadService } from 'src/features/upload/upload.service';

@Injectable()
export class ArquivoService {
  private supabase;

  private readonly repository: ArquivoRepository;
  private readonly usuarioRepository: UsuarioRepository;

  constructor(
    private readonly dataSource: DataSource,
    private readonly uploadService: UploadService,
  ) {
    const supabaseURL = process.env.SUPABASE_URL;
    const supabaseKEY = process.env.SUPABASE_KEY;

    this.repository = new ArquivoRepository(this.dataSource.manager);
    this.usuarioRepository = new UsuarioRepository(this.dataSource.manager);
    this.supabase = createClient(supabaseURL, supabaseKEY);
  }

  compTotal = 100;

  async save(
    usuarioId: number,
    bodyDto: ArquivoDto,
    file: Express.Multer.File,
  ): Promise<number> {
    const usuario = await this.usuarioRepository.getUsuarioAluno(usuarioId);

    if (!usuario) {
      throw new BadRequestException('Usuário não encontrado.');
    }

    if (usuario.status === StatusEnum.INATIVO) {
      throw new BadRequestException(
        'Usuário inativo. Não é permitido adicionar um arquivo.',
      );
    }

    if (usuario.perfil !== TipoUsuarioEnum.ALUNO) {
      throw new BadRequestException('O Usuário não é do Tipo Aluno.');
    }

    const horasAtualmenteAverbadas =
      await this.repository.getTotalHorasAverbadas(usuarioId);

    if (horasAtualmenteAverbadas >= this.compTotal) {
      throw new BadRequestException(
        'Você já completou as horas complementares, não é permitido adicionar mais arquivos.',
      );
    }

    const atividade = await this.repository.getAtividadePorId(
      bodyDto.atividadeId,
    );

    if (!atividade) {
      throw new BadRequestException('Atividade não encontrada.');
    }

    const totalHorasDimensao =
      await this.repository.getTotalHorasAverbadasPorDimensao(
        usuarioId,
        atividade.dimensao.id,
      );

    if (totalHorasDimensao + bodyDto.horas > atividade.dimensao.horaTotal) {
      throw new BadRequestException(
        `Esta dimensão já atingiu seu limite de horas.`,
      );
    }

    const totalHorasAtividade =
      await this.repository.getHorasAverbadasPorTipoAtividade(
        usuarioId,
        bodyDto.atividadeId,
      );

    if (totalHorasAtividade + bodyDto.horas > atividade.horaTotal) {
      throw new BadRequestException(
        `A atividade "${atividade.nome}" já atingiu seu limite de horas.`,
      );
    }

    const dimensaoAtividade = await this.repository.getDimensaoAtividadeId(
      bodyDto.atividadeId,
      bodyDto.dimensaoId,
    );

    if (!dimensaoAtividade) {
      throw new BadRequestException(
        'A dimensão informada não está associada à atividade selecionada.',
      );
    }

    if (bodyDto.dimensaoId !== dimensaoAtividade.dimensaoId) {
      throw new BadRequestException(
        'A dimensão deve estar de acordo com o tipo de atividade.',
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
      usuarioId,
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

    const dimensaoAtividade = await this.repository.getDimensaoAtividadeId(
      bodyDto.atividadeId,
      bodyDto.dimensaoId,
    );

    if (!dimensaoAtividade) {
      throw new BadRequestException(
        'A dimensão informada não está associada à atividade selecionada.',
      );
    }

    if (bodyDto.dimensaoId !== dimensaoAtividade.dimensaoId) {
      throw new BadRequestException(
        'A dimensão deve estar de acordo com o tipo de atividade.',
      );
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
      await this.repository.getTotalHorasAverbadas(arquivo.usuarioId);

    const horasAverbadasPorDimensao =
      await this.repository.getTotalHorasAverbadasPorDimensao(
        arquivo.usuarioId,
        arquivo.atividade.dimensao.id,
      );

    const horasAverbadasPorTipoAtividade =
      await this.repository.getHorasAverbadasPorTipoAtividade(
        arquivo.usuarioId,
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
    usuarioId: number,
    filtros: FiltroArquivoDto,
  ): Promise<PaginationQueryResponseDto<Arquivo>> {
    const list = await this.repository.getAll(usuarioId, filtros);

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
    const arquivo = await this.repository.findOne({
      where: { id },
    });

    if (!arquivo) {
      throw new NotFoundException('Arquivo não encontrado.');
    }

    if (arquivo.situacao !== SituacaoEnum.EM_ANALISE) {
      throw new BadRequestException(
        'Somente arquivos em análise podem ser excluídos.',
      );
    }

    if (arquivo.caminho_arquivo) {
      await this.uploadService.deleteFile(arquivo.caminho_arquivo);
    }

    await this.repository.delete(id);
  }

  /*  async delete(id: number): Promise<void> {
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
  } */

  async getHorasPorTodasDimensoes(usuarioId: number) {
    const dimensoes = await this.repository.getTodasDimensoes();

    const resultado = [];

    for (const dimensao of dimensoes) {
      const arquivos = await this.repository.buscarPorDimensao(
        usuarioId,
        dimensao.id,
      );

      const limiteDimensao = dimensao.horaTotal ?? 0;

      const totalHorasAverbadas = arquivos.reduce((total, arquivo) => {
        const horas = arquivo.horasAverbadas ?? arquivo.horas ?? 0;
        return total + horas;
      }, 0);

      resultado.push({
        dimensaoId: dimensao.id,
        nome: dimensao.nome,
        totalHorasAverbadas,
        limiteDimensao,
        horasRestantes: Math.max(0, limiteDimensao - totalHorasAverbadas),
      });
    }

    return resultado;
  }

  async getHorasUsuario(usuarioId: number) {
    // Obtemos as atividades, dimensões e suas respectivas horas
    const atividades = await this.repository.getHorasPorAtividade(usuarioId);

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

  async getHorasPorDimensaoComTotal(usuarioId: number, dimensaoId: number) {
    const existeDimensao = await this.repository.getDimensaoPorId(dimensaoId);

    if (!existeDimensao) {
      throw new BadRequestException('Essa Dimensão não existe.');
    }

    const arquivos = await this.repository.buscarPorDimensao(
      usuarioId,
      dimensaoId,
    );

    if (!arquivos.length) {
      return {
        dimensao: null,
        atividade: null,
        totalHorasAverbadas: 0,
        horasRestantes: 0,
        limiteDimensao: 0,
        limiteAtividade: 0,
      };
    }

    // Agrupa atividades
    const atividadesMap = new Map<number, any>();

    for (const arquivo of arquivos) {
      const atividadeId = arquivo.atividadeId;
      const atividadeNome = arquivo.atividade?.nome ?? 'Atividade sem nome';
      const limiteAtividade = arquivo.atividade?.horaTotal ?? 0;
      const limiteDimensao = arquivo.dimensao?.horaTotal ?? 0;
      const horas = arquivo.horasAverbadas ?? arquivo.horas ?? 0;

      if (!atividadesMap.has(atividadeId)) {
        atividadesMap.set(atividadeId, {
          atividadeId,
          atividadeNome,
          limiteAtividade,
          limiteDimensao,
          totalHorasAverbadas: 0,
        });
      }

      const atividade = atividadesMap.get(atividadeId);
      atividade.totalHorasAverbadas += horas;
    }

    // Gera lista formatada
    const atividades = Array.from(atividadesMap.values()).map((a) => ({
      atividadeId: a.atividadeId,
      atividadeNome: a.atividadeNome,
      limiteAtividade: a.limiteAtividade,
      totalHorasAverbadas: a.totalHorasAverbadas,
      horasRestantes: Math.max(0, a.limiteAtividade - a.totalHorasAverbadas),
    }));

    // Calcula totais da dimensão
    const limiteDimensao = arquivos[0].dimensao?.horaTotal ?? 0;
    const totalHorasAverbadas = atividades.reduce(
      (soma, a) => soma + a.totalHorasAverbadas,
      0,
    );
    const horasRestantes = Math.max(0, limiteDimensao - totalHorasAverbadas);

    return {
      dimensao: arquivos[0].dimensao?.nome,
      limiteDimensao,
      totalHorasAverbadas,
      horasRestantes,
      atividades,
    };
  }

  /**
   * 🔹 Consulta horas de uma atividade específica dentro de uma dimensão
   */
  async getHoras(usuarioId: number, atividadeId: number, dimensaoId: number) {
    const existeDimensao = await this.repository.getDimensaoPorId(dimensaoId);

    if (!existeDimensao) {
      throw new BadRequestException('Essa Dimensão não existe.');
    }

    const existeAtividade =
      await this.repository.getAtividadePorId(atividadeId);

    if (!existeAtividade) {
      throw new BadRequestException('Essa Atividade não existe.');
    }

    const arquivos = await this.repository.buscarPorDimensaoEAtividade(
      usuarioId,
      atividadeId,
      dimensaoId,
    );

    if (!arquivos.length) {
      return {
        dimensao: null,
        atividade: null,
        totalHorasAverbadas: 0,
        horasRestantes: 0,
        limiteDimensao: 0,
        limiteAtividade: 0,
      };
    }

    // Agrupa atividades
    const atividadesMap = new Map<number, any>();

    for (const arquivo of arquivos) {
      const atividadeId = arquivo.atividadeId;
      const atividadeNome = arquivo.atividade?.nome ?? 'Atividade sem nome';
      const limiteAtividade = arquivo.atividade?.horaTotal ?? 0;
      const limiteDimensao = arquivo.dimensao?.horaTotal ?? 0;
      const horas = arquivo.horasAverbadas ?? arquivo.horas ?? 0;

      if (!atividadesMap.has(atividadeId)) {
        atividadesMap.set(atividadeId, {
          atividadeId,
          atividadeNome,
          limiteAtividade,
          limiteDimensao,
          totalHorasAverbadas: 0,
        });
      }

      const atividade = atividadesMap.get(atividadeId);
      atividade.totalHorasAverbadas += horas;
    }

    // Gera lista formatada
    const atividades = Array.from(atividadesMap.values()).map((a) => ({
      atividadeId: a.atividadeId,
      atividadeNome: a.atividadeNome,
      limiteAtividade: a.limiteAtividade,
      totalHorasAverbadas: a.totalHorasAverbadas,
      horasRestantes: Math.max(0, a.limiteAtividade - a.totalHorasAverbadas),
    }));

    // Calcula totais da dimensão
    const limiteDimensao = arquivos[0].dimensao?.horaTotal ?? 0;
    const totalHorasAverbadas = atividades.reduce(
      (soma, a) => soma + a.totalHorasAverbadas,
      0,
    );
    const horasRestantes = Math.max(0, limiteDimensao - totalHorasAverbadas);

    return {
      dimensao: arquivos[0].dimensao?.nome,
      limiteDimensao,
      totalHorasAverbadas,
      horasRestantes,
      atividades,
    };
  }
}
