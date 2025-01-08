import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsuarioService } from './services/usuario.service';
import { UsuarioController } from './controllers/usuario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';

@Module({
  imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([Usuario])],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}
