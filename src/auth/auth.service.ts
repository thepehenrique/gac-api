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

    if (email.endsWith('@aluno.faeterj-prc.faetec.rj.gov.br')) {
      tipoUsuario = TipoUsuarioEnum.ALUNO;
      nome = email.split('.')[0];
      matricula = email.split('.')[1].split('@')[0];
    } else if (email.endsWith('@faeterj-prc.faetec.rj.gov.br')) {
      tipoUsuario = TipoUsuarioEnum.PROFESSOR;
      nome = email.split('.')[0];
    } else {
      throw new UnauthorizedException('Domínio do e-mail não autorizado.');
    }

    novoUsuario = true;

    const usuarioDto = new UsuarioDto({
      perfil: tipoUsuario,
      nome,
      email,
      matricula,
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

    // ✅ garante ADMIN
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
