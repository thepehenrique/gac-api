import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TipoUsuarioEnum } from 'src/features/dominios/enum/tipo-usuario.enum';
import { UsuarioDto } from 'src/features/usuario/dtos/usuario.dto';
import { UsuarioService } from 'src/features/usuario/services/usuario.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly usuarioService: UsuarioService,
  ) {}

  async validateOAuthLogin(email: string, name: string): Promise<string> {
    const payload = { email, name };
    return this.jwtService.sign(payload);
  }

  async googleLogin(req) {
    if (!req.user) {
      throw new UnauthorizedException('Usuário não autenticado.');
    }

    const { email } = req.user;
    let nome: string;
    let tipoUsuario: TipoUsuarioEnum;
    let matricula: string | null = null;

    if (email.endsWith('@aluno.faeterj-prc.faetec.rj.gov.br')) {
      tipoUsuario = TipoUsuarioEnum.ALUNO;
      nome = email.split('.')[0];
      matricula = email.split('.')[1].split('@')[0];
    } else if (email.endsWith('@faeterj-prc.faetec.rj.gov.br')) {
      tipoUsuario = TipoUsuarioEnum.PROFESSOR;
    } else {
      throw new UnauthorizedException(
        'Domínio do e-mail não autorizado para login.',
      );
    }

    // Verifica se o usuário já existe
    const usuarioExistente = await this.usuarioService.getByEmail(email);

    let novoUsuario = false;

    if (!usuarioExistente) {
      novoUsuario = true;
      const usuarioDto = new UsuarioDto({
        idPerfil: tipoUsuario === TipoUsuarioEnum.ALUNO ? 2 : 3,
        nome,
        email,
        matricula,
      });

      await this.usuarioService.save(usuarioDto);
    }

    const jwt = await this.validateOAuthLogin(email, nome);

    return {
      token: jwt,
      novoUsuario,
    };
  }
}
