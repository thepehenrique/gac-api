import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsuarioModule } from './features/usuario/usuario.module';

import { UploadModule } from './features/upload/upload.module';
import { DominioModule } from './features/dominios/dominio.module';
import { MulterModule } from '@nestjs/platform-express';
import { ArquivoModule } from './features/arquivo/arquivo.module';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads', // Diretório temporário (usado pelo multer)
    }),
    ConfigModule.forRoot({
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_SUPABASE,
      ssl: {
        rejectUnauthorized: false, // necessário no Supabase
      },
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),

    /* TypeOrmModule.forRoot({
      type: 'postgres',
      database: process.env.DB_DATABASE,
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      entities: [Usuario, Arquivo, Perfil, Atividade, Dimensao, Situacao],
      // synchronize: true,
      schema: 'gac',
    }), */
    DominioModule,
    AuthModule,
    UsuarioModule,
    ArquivoModule,
    UploadModule,
  ],
})
export class AppModule {}
