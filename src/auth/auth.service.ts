/* import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TipoUsuarioEnum } from 'src/features/dominios/enum/tipo-usuario.enum';

@Injectable()
export class AuthService {
  googleLogin(req) {
    if (!req.user) {
      throw new UnauthorizedException('Usuário não autenticado.');
    }

    const email = req.user.email;
    let tipoUsuario: TipoUsuarioEnum;

    // Verifica o domínio do e-mail e define o tipo de usuário
    if (email.endsWith('@aluno.faeterj-prc.faetec.rj.gov.br')) {
      tipoUsuario = TipoUsuarioEnum.ALUNO;
    } else if (email.endsWith('@faeterj-prc.faetec.rj.gov.br')) {
      tipoUsuario = TipoUsuarioEnum.PROFESSOR;
    } else {
      throw new UnauthorizedException(
        'Domínio do e-mail não autorizado para login.',
      );
    }

    return {
      message: 'Usuário autenticado com sucesso!',
      user: {
        ...req.user,
        tipoUsuario, // Adiciona o tipo de usuário no retorno
      },
    };
  }
} */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { StatusEnum } from 'src/features/dominios/enum/status.enum';
import { TipoUsuarioEnum } from 'src/features/dominios/enum/tipo-usuario.enum';
import { UsuarioDto } from 'src/features/usuario/dtos/usuario.dto';
import { UsuarioService } from 'src/features/usuario/services/usuario.service';

/* import { Injectable, UnauthorizedException } from '@nestjs/common';
import { StatusEnum } from 'src/features/dominios/enum/status.enum';
import { TipoUsuarioEnum } from 'src/features/dominios/enum/tipo-usuario.enum';
import { UsuarioDto } from 'src/features/usuario/dtos/usuario.dto';
import { UsuarioService } from 'src/features/usuario/services/usuario.service';

@Injectable()
export class AuthService {
  constructor(private readonly usuarioService: UsuarioService) {}

  async googleLogin(req) {
    if (!req.user) {
      throw new UnauthorizedException('Usuário não autenticado.');
    }

    const email = req.user.email;
    const firstName = req.user.given_name;
    const lastName = req.user.family_name;

    let tipoUsuario: TipoUsuarioEnum;
    let matricula: string | null = null;

    // Determina o tipo de usuário e matrícula
    if (email.endsWith('@aluno.faeterj-prc.faetec.rj.gov.br')) {
      tipoUsuario = TipoUsuarioEnum.ALUNO;
      matricula = email.split('.')[1].split('@')[0]; // Extrai a matrícula
    } else if (email.endsWith('@faeterj-prc.faetec.rj.gov.br')) {
      tipoUsuario = TipoUsuarioEnum.PROFESSOR;
    } else {
      throw new UnauthorizedException(
        'Domínio do e-mail não autorizado para login.',
      );
    }

    const usuarioDto = new UsuarioDto({
      idPerfil: tipoUsuario === TipoUsuarioEnum.ALUNO ? 1 : 2, // Exemplo de ID de perfil
      nome: `${firstName} ${lastName}`,
      email,
      matricula,
      tipoUsuario,
      status: StatusEnum.ATIVO,
    });

    // Salva o usuário no banco de dados
    const usuarioId = await this.usuarioService.salvar(usuarioDto);

    return {
      message: 'Usuário autenticado e salvo com sucesso!',
      user: { id: usuarioId, ...usuarioDto },
    };
  }
} */

@Injectable()
export class AuthService {
  constructor(private readonly usuarioService: UsuarioService) {}

  async googleLogin(req) {
    if (!req.user) {
      throw new UnauthorizedException('Usuário não autenticado.');
    }

    const { email } = req.user;

    let nome: string;
    let tipoUsuario: TipoUsuarioEnum;
    let matricula: string | null = null;

    // verifica o domínio do usuário
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

    // Verifica se o usuário já existe no banco pelo e-mail
    const usuarioExistente = await this.usuarioService.getByEmail(email);

    if (usuarioExistente) {
      return {
        message: 'Usuário logado e já cadastrado no sistema.',
        user: usuarioExistente,
      };
    }

    // Se não existir, cria um novo usuário
    const usuarioDto = new UsuarioDto({
      idPerfil: tipoUsuario === TipoUsuarioEnum.ALUNO ? 1 : 2,
      nome,
      email,
      matricula,
      status: StatusEnum.ATIVO,
    });

    // Salva o novo usuário no banco de dados
    const usuarioId = await this.usuarioService.save(usuarioDto);

    return {
      message: 'Usuário autenticado e cadastrado com sucesso!',
      user: { id: usuarioId, ...usuarioDto },
    };
  }
}
