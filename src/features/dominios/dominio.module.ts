import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Atividade } from './entities/atividade.entity';
import { DominioController } from './controllers/dominio.controller';
import { DominioService } from './services/dominio.service';

@Module({
  imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([Atividade])],
  controllers: [DominioController],
  providers: [DominioService],
  exports: [DominioService],
})
export class DominioModule {}
