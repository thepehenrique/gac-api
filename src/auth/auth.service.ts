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

  async validateOAuthLogin(usuario: UsuarioDto): Promise<string> {
    const payload = {
      email: usuario.email,
      nome: usuario.nome,
      tipoUsuario: usuario.idPerfil,
      matricula: usuario.matricula,
    };

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
      nome = req.user.name; // Pega o nome completo do Google
    } else {
      throw new UnauthorizedException('Domínio do e-mail não autorizado.');
    }

    let usuario = await this.usuarioService.getByEmail(email);
    let novoUsuario = false;

    if (!usuario) {
      novoUsuario = true;

      const usuarioDto = new UsuarioDto({
        idPerfil: tipoUsuario === TipoUsuarioEnum.ALUNO ? 2 : 3,
        nome,
        email,
        matricula,
      });

      await this.usuarioService.save(usuarioDto);
      usuario = await this.usuarioService.getByEmail(email); // Pegamos o usuário com ID agora
    }

    const jwt = await this.validateOAuthLogin(UsuarioDto.fromEntity(usuario));

    return {
      token: jwt,
      novoUsuario,
      usuarioId: usuario.id,
    };
  }
}
