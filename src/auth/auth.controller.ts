import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { AuthService } from './auth.service';
import { Request } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
      `http://localhost:4200/login?token=${loginResponse.token}&usuarioId=${loginResponse.usuarioId}&novoUsuario=${loginResponse.novoUsuario}`,
    );
  }
}
