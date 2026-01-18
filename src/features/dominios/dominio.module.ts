import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Atividade } from './entities/atividade.entity';
import { DominioController } from './controllers/dominio.controller';
import { DominioService } from './services/dominio.service';
import { ArquivoModule } from '../arquivo/arquivo.module';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([Atividade]),
    ArquivoModule,
    UsuarioModule,
  ],
  controllers: [DominioController],
  providers: [DominioService],
  exports: [DominioService],
})
export class DominioModule {}
