import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsuarioModule } from './features/usuario/usuario.module';
import { Usuario } from './features/usuario/entities/usuario.entity';
import { ArquivoModule } from './features/arquivo/arquivo.module';
import { Arquivo } from './features/arquivo/entities/arquivo.entity';

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
      entities: [Usuario, Arquivo],
      synchronize: true,
      schema: 'APPGAC',
    }),
    AuthModule,
    UsuarioModule,
    ArquivoModule,
  ],
})
export class AppModule {}
