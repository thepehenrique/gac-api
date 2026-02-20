import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FlagRegistroEnum } from 'src/features/dominios/enum/flag-registro.enum';
import { TipoUsuarioEnum } from 'src/features/dominios/enum/tipo-usuario.enum';
import { UsuarioDto } from 'src/features/usuario/dtos/usuario.dto';
import { UsuarioService } from 'src/features/usuario/services/usuario.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly usuarioService: UsuarioService,
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
    } else if (email === process.env.EMAIL_ADMIN) {
      tipoUsuario = TipoUsuarioEnum.ADMIN;
      nome = email.substring(0, 5);
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
}
