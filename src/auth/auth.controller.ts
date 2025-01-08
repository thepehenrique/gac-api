import { Controller, Get, UseGuards, Req } from '@nestjs/common';
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

  @ApiOperation({ summary: 'Redireciona após login com Google OAuth' })
  @ApiResponse({
    status: 200,
    description: 'Retorna informações do usuário autenticado.',
  })
  @Get('google/redirect')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthRedirect(@Req() req: Request) {
    return this.authService.googleLogin(req);
  }
}
