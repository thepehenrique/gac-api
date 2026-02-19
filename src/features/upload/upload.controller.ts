import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { FileUploadDto } from './upload.dto';
import { JwtAuthGuard } from 'src/commom/guards/jwt-auth.guard';
import { RolesGuard } from 'src/commom/guards/roles.guard';
import { Roles } from 'src/commom/decorators/roles.decorator';
import { TipoUsuarioEnum } from '../dominios/enum/tipo-usuario.enum';

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Roles(
    TipoUsuarioEnum.ADMIN,
    TipoUsuarioEnum.ALUNO,
    TipoUsuarioEnum.PROFESSOR,
  )
  @Post('/')
  @ApiOperation({ summary: 'Upload de um arquivo no Supabase Storage' })
  @ApiConsumes('multipart/form-data') // Define que o endpoint recebe arquivos
  @ApiBody({
    description: 'Arquivo a ser enviado',
    type: FileUploadDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('Nenhum arquivo foi enviado.');
    }
    return await this.uploadService.upload(file);
  }

  @Roles(
    TipoUsuarioEnum.ADMIN,
    TipoUsuarioEnum.ALUNO,
    TipoUsuarioEnum.PROFESSOR,
  )
  @Get(':fileName')
  @ApiOperation({ summary: 'Visualiza um arquivo do Supabase Storage' })
  async getFileUrl(@Param('fileName') fileName: string) {
    const url = await this.uploadService.getFileUrl(fileName);
    if (!url) {
      throw new NotFoundException('Arquivo não encontrado');
    }
    return { url };
  }

  @Roles(
    TipoUsuarioEnum.ADMIN,
    TipoUsuarioEnum.ALUNO,
    TipoUsuarioEnum.PROFESSOR,
  )
  @Delete(':fileName')
  @ApiOperation({ summary: 'Exclui um arquivo do Supabase Storage' })
  async deleteFile(@Param('fileName') fileName: string) {
    return await this.uploadService.deleteFile(fileName);
  }
}
