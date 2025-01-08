import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { UsuarioModule } from 'src/features/usuario/usuario.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/features/usuario/entities/usuario.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UsuarioModule,
    TypeOrmModule.forFeature([Usuario]),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy],
})
export class AuthModule {}
