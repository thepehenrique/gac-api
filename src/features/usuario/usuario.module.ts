import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsuarioService } from './services/usuario.service';
import { UsuarioController } from './controllers/usuario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { UsuarioRepository } from './repository/usuario.repository';
import { EntityManager } from 'typeorm';

@Module({
  imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([Usuario])],
  controllers: [UsuarioController],
  providers: [
    UsuarioService,
    {
      provide: UsuarioRepository,
      useFactory: (entityManager: EntityManager) => {
        return new UsuarioRepository(entityManager);
      },
      inject: [EntityManager],
    },
  ],
  exports: [UsuarioService, UsuarioRepository],
})
export class UsuarioModule {}
