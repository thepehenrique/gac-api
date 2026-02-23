import {
  Controller,
  Get,
  UseGuards,
  Req,
  Res,
  Post,
  Body,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { LoginAdminDto } from 'src/features/dominios/dto/login-admin.dto';
import { Roles } from 'src/commom/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/commom/guards/jwt-auth.guard';
import { RolesGuard } from 'src/commom/guards/roles.guard';
import { TipoUsuarioEnum } from 'src/features/dominios/enum/tipo-usuario.enum';
import { TrocarSenhaAdminDto } from './dto/trocar-senha-admin.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login-admin')
  async login(@Body() dto: LoginAdminDto) {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: 'Inicia o login com Google OAuth' })
  @ApiResponse({
    status: 200,
    description: 'Redireciona para autenticação do Google.',
  })
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async googleAuth(@Req() req: Request) {}

  @Get('google/redirect')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res) {
    const loginResponse = await this.authService.googleLogin(req);

    return res.redirect(
      `http://localhost:4200/login?token=${loginResponse.token}&usuarioId=${loginResponse.usuarioId}&novoUsuario=${loginResponse.novoUsuario}&tipoUsuario=${loginResponse.tipoUsuario}`,
    );
  }

  @Patch('admin/trocar-senha')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuarioEnum.ADMIN)
  trocarSenhaAdmin(@Req() req, @Body() dto: TrocarSenhaAdminDto) {
    return this.authService.trocarSenhaAdmin(req.user.sub, dto);
  }
}
