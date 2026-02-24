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
      throw new BadRequestException('O usuário não é do tipo aluno.');
    }

    const atividade = await this.repository.getAtividadePorId(
      bodyDto.atividadeId,
    );

    if (!atividade) {
      throw new BadRequestException('Atividade não encontrada.');
    }

    const dimensaoAtividade = await this.repository.getDimensaoAtividadeId(
      bodyDto.atividadeId,
      bodyDto.dimensaoId,
    );

    if (!dimensaoAtividade) {
      throw new BadRequestException(
        'A dimensão informada não pertence à atividade.',
      );
    }

    const dimensaoId = dimensaoAtividade.dimensaoId;

    const totalHorasDimensao =
      await this.repository.getTotalHorasAverbadasPorDimensao(
        usuarioId,
        dimensaoId,
      );

    if (totalHorasDimensao >= atividade.dimensao.horaTotal) {
      throw new BadRequestException(
        'Esta dimensão já atingiu o limite máximo de horas. Não é possível enviar novos arquivos.',
      );
    }

    // ================= VALIDA HORAS =================

    const horasSolicitadas = Number(bodyDto.horas);

    if (!Number.isFinite(horasSolicitadas) || horasSolicitadas <= 0) {
      throw new BadRequestException('Quantidade de horas inválida.');
    }

    if (!file || file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Apenas arquivos PDF são permitidos.');
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
      { auth: { persistSession: false } },
    );

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

    if (existingFiles?.length) {
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

    // ================= SALVAR =================

    const registro = new ArquivoDto(bodyDto).asEntity(
      usuarioId,
      new Date(),
      new Arquivo(),
    );

    registro.caminho_arquivo = uploadData.path;
    registro.situacao = SituacaoEnum.EM_ANALISE;
    registro.horasAverbadas = null;

    const arquivoSalvo = await this.repository.save(registro);

    return arquivoSalvo.id;
  }

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
    const arquivo = await this.repository.getArquivoParaAprovacao(id);

    if (!arquivo) {
      throw new NotFoundException('Arquivo não encontrado.');
    }

    if (arquivo.situacao !== SituacaoEnum.EM_ANALISE) {
      throw new BadRequestException('Este arquivo já foi analisado.');
    }

    if (!bodyDto.aprovado) {
      if (!bodyDto.comentario) {
        throw new BadRequestException('O comentário é obrigatório ao recusar.');
      }

      arquivo.situacao = SituacaoEnum.RECUSADO;
      arquivo.comentario = bodyDto.comentario;
      arquivo.horasAverbadas = 0;
      /*       arquivo.dataAprovacao = new Date();
       */
      await this.repository.save(arquivo);

      return arquivo.id;
    }

    const horasAverbadas = Number(bodyDto.horasAverbadas);

    if (!horasAverbadas || horasAverbadas <= 0) {
      throw new BadRequestException(
        'Informe uma quantidade válida de horas averbadas.',
      );
    }

    const totalHorasAluno = await this.repository.getTotalHorasAverbadas(
      arquivo.usuarioId,
    );

    if (totalHorasAluno + horasAverbadas > this.compTotal) {
      throw new BadRequestException(
        'Ultrapassa o limite total de horas complementares.',
      );
    }

    const totalHorasDimensao =
      await this.repository.getTotalHorasAverbadasPorDimensao(
        arquivo.usuarioId,
        arquivo.atividade.dimensao.id,
      );

    const restanteDimensao =
      arquivo.atividade.dimensao.horaTotal - totalHorasDimensao;

    if (horasAverbadas > restanteDimensao) {
      throw new BadRequestException(
        `A dimensão possui apenas ${restanteDimensao} horas disponíveis.`,
      );
    }

    const totalHorasAtividade =
      await this.repository.getHorasAverbadasPorTipoAtividade(
        arquivo.usuarioId,
        arquivo.atividade.id,
      );

    const restanteAtividade = arquivo.atividade.horaTotal - totalHorasAtividade;

    if (horasAverbadas > restanteAtividade) {
      throw new BadRequestException(
        `A atividade permite apenas ${restanteAtividade} horas restantes.`,
      );
    }

    arquivo.situacao = SituacaoEnum.APROVADO;
    arquivo.horasAverbadas = horasAverbadas;
    arquivo.comentario = null;
    /*     arquivo.dataAprovacao = new Date();
     */
    await this.repository.save(arquivo);

    return arquivo.id;
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
    const atividades = await this.repository.getHorasPorAtividade(usuarioId);

    let totalHoras = 0;
    atividades.forEach((atividade) => {
      totalHoras += atividade.totalHoras;
    });

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

    const atividades = Array.from(atividadesMap.values()).map((a) => ({
      atividadeId: a.atividadeId,
      atividadeNome: a.atividadeNome,
      limiteAtividade: a.limiteAtividade,
      totalHorasAverbadas: a.totalHorasAverbadas,
      horasRestantes: Math.max(0, a.limiteAtividade - a.totalHorasAverbadas),
    }));

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

    const atividades = Array.from(atividadesMap.values()).map((a) => ({
      atividadeId: a.atividadeId,
      atividadeNome: a.atividadeNome,
      limiteAtividade: a.limiteAtividade,
      totalHorasAverbadas: a.totalHorasAverbadas,
      horasRestantes: Math.max(0, a.limiteAtividade - a.totalHorasAverbadas),
    }));

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
