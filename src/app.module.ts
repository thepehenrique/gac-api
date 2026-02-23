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
      dest: './uploads',
    }),
    ConfigModule.forRoot({
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_SUPABASE,
      ssl: {
        rejectUnauthorized: false,
      },
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),

    AuthModule,
    ArquivoModule,
    ArquivoModule,
    DominioModule,
    UploadModule,
    UsuarioModule,
  ],
})
export class AppModule {}
