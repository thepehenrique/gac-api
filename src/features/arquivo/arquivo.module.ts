import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Arquivo } from './entities/arquivo.entity';
import { ArquivoController } from './controllers/arquivo.controller';
import { ArquivoService } from './services/arquivo.service';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UsuarioModule,
    TypeOrmModule.forFeature([Arquivo]),
  ],
  controllers: [ArquivoController],
  providers: [ArquivoService],
  exports: [ArquivoService],
})
export class ArquivoModule {}
