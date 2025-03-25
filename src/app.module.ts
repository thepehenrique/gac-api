import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsuarioModule } from './features/usuario/usuario.module';
import { Usuario } from './features/usuario/entities/usuario.entity';
import { ArquivoModule } from './features/arquivo/arquivo.module';
import { Arquivo } from './features/arquivo/entities/arquivo.entity';
import { Perfil } from './features/dominios/entities/perfil.entity';
import { Atividade } from './features/dominios/entities/atividade.entity';
import { Situacao } from './features/dominios/entities/situacao.entity';
import { Dimensao } from './features/dominios/entities/dimensao.entity';
import { UploadModule } from './features/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      database: process.env.DB_DATABASE,
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      entities: [Usuario, Arquivo, Perfil, Atividade, Dimensao, Situacao],
      // synchronize: true,
      schema: 'gac',
    }),
    AuthModule,
    UsuarioModule,
    ArquivoModule,
    UploadModule,
  ],
})
export class AppModule {}
