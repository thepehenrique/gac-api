import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginAdminDto } from 'src/features/dominios/dto/login-admin.dto';
import { FlagRegistroEnum } from 'src/features/dominios/enum/flag-registro.enum';
import { TipoUsuarioEnum } from 'src/features/dominios/enum/tipo-usuario.enum';
import { UsuarioDto } from 'src/features/usuario/dtos/usuario.dto';
import { UsuarioRepository } from 'src/features/usuario/repository/usuario.repository';
import { UsuarioService } from 'src/features/usuario/services/usuario.service';
import * as bcrypt from 'bcrypt';
import { TrocarSenhaAdminDto } from './dto/trocar-senha-admin.dto';
import { CursoEnum } from 'src/features/usuario/enum/curso.enum';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly usuarioService: UsuarioService,
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  async validateOAuthLogin(usuario: UsuarioDto): Promise<string> {
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      tipoUsuario: usuario.perfil,
      matricula: usuario.matricula,
    };

    return this.jwtService.sign(payload);
  }

  async googleLogin(req) {
    if (!req.user) {
      throw new UnauthorizedException('Usuário não autenticado.');
    }

    const { email } = req.user;

    let usuario = await this.usuarioService.getByEmail(email);
    let novoUsuario = false;

    if (usuario) {
      const jwt = await this.validateOAuthLogin(UsuarioDto.fromEntity(usuario));

      return {
        token: jwt,
        novoUsuario: false,
        usuarioId: usuario.id,
        tipoUsuario: usuario.perfil,
        gestor: usuario.gestor,
      };
    }

    let nome: string;
    let tipoUsuario: TipoUsuarioEnum;
    let matricula: string | null = null;

    let anoIngresso: string | null = null;
    let semestre: string | null = null;
    let cursoEnum: CursoEnum | null = null;

    if (email.endsWith('@aluno.faeterj-prc.faetec.rj.gov.br')) {
      tipoUsuario = TipoUsuarioEnum.ALUNO;

      const partes = email.split('@')[0].split('.');

      if (partes.length < 2) {
        throw new UnauthorizedException('Formato de e-mail inválido.');
      }

      nome = partes[0];

      if (partes.length === 3) {
        const codigo = partes[2];

        if (codigo.length < 5) {
          throw new UnauthorizedException('Código inválido no e-mail.');
        }

        anoIngresso = codigo.substring(0, 2);
        semestre = codigo.substring(2, 3);
        const cursoSigla = codigo.substring(3).toLowerCase();

        if (!['1', '2'].includes(semestre)) {
          throw new UnauthorizedException('Semestre inválido no e-mail.');
        }

        const mapaCurso: Record<string, CursoEnum> = {
          ads: CursoEnum.ANALISE_DES_SISTEMA,
          si: CursoEnum.SISTEMA_DE_INFORMACAO,
          ga: CursoEnum.GESTAO_AMBIENTAL,
        };

        cursoEnum = mapaCurso[cursoSigla];

        if (!cursoEnum) {
          throw new UnauthorizedException('Curso inválido no e-mail.');
        }

        matricula = null;
      } else if (partes.length === 2) {
        matricula = null;
      } else {
        throw new UnauthorizedException('Formato de e-mail inválido.');
      }
    } else if (email.endsWith('@faeterj-prc.faetec.rj.gov.br')) {
      tipoUsuario = TipoUsuarioEnum.PROFESSOR;

      const partes = email.split('@')[0].split('.');
      nome = partes[0];
    } else {
      throw new UnauthorizedException('Domínio do e-mail não autorizado.');
    }

    novoUsuario = true;

    const usuarioDto = new UsuarioDto({
      perfil: tipoUsuario,
      nome,
      email,
      matricula: null,
      anoIngresso: anoIngresso ?? undefined,
      semestreIngresso: semestre ?? undefined,
      curso: cursoEnum ?? undefined,
      gestor:
        tipoUsuario === TipoUsuarioEnum.PROFESSOR
          ? FlagRegistroEnum.NAO
          : undefined,
    });

    await this.usuarioService.salvar(usuarioDto);

    usuario = await this.usuarioService.getByEmail(email);

    const jwt = await this.validateOAuthLogin(UsuarioDto.fromEntity(usuario));

    return {
      token: jwt,
      novoUsuario,
      usuarioId: usuario.id,
      tipoUsuario: usuario.perfil,
      gestor: usuario.gestor,
    };
  }

  async login(dto: LoginAdminDto) {
    const usuario = await this.usuarioRepository.getByNome(dto.nome);

    if (!usuario) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    if (usuario.perfil !== TipoUsuarioEnum.ADMIN) {
      throw new UnauthorizedException(
        'Este login é exclusivo para administradores.',
      );
    }

    const senhaValida = await bcrypt.compare(dto.senha, usuario.senha);

    if (!senhaValida) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    const payload = {
      sub: usuario.id,
      nome: usuario.nome,
      tipoUsuario: usuario.perfil,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async trocarSenhaAdmin(usuarioId: number, dto: TrocarSenhaAdminDto) {
    const usuario = await this.usuarioRepository.getById(usuarioId);

    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    if (usuario.perfil !== TipoUsuarioEnum.ADMIN) {
      throw new UnauthorizedException(
        'Apenas administradores podem alterar senha.',
      );
    }

    const senhaValida = await bcrypt.compare(dto.senhaAtual, usuario.senha);

    if (!senhaValida) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    if (dto.novaSenha !== dto.confirmarNovaSenha) {
      throw new UnauthorizedException('Nova senha e confirmação não coincidem');
    }

    const mesmaSenha = await bcrypt.compare(dto.novaSenha, usuario.senha);

    if (mesmaSenha) {
      throw new UnauthorizedException(
        'A nova senha deve ser diferente da atual',
      );
    }

    const hash = await bcrypt.hash(dto.novaSenha, 10);

    usuario.senha = hash;
    usuario.dtAtualizacao = new Date();

    await this.usuarioRepository.salvar(usuario);

    return {
      message: 'Senha alterada com sucesso',
    };
  }
}
