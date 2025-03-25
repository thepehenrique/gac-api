import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { FileUploadDto } from './upload.dto';

@ApiTags('Upload') // Agrupa os endpoints no Swagger
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

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

  @Get(':fileName')
  @ApiOperation({ summary: 'Visualiza um arquivo do Supabase Storage' })
  async getFileUrl(@Param('fileName') fileName: string) {
    const url = await this.uploadService.getFileUrl(fileName);
    if (!url) {
      throw new NotFoundException('Arquivo não encontrado');
    }
    return { url };
  }

  @Delete(':fileName')
  @ApiOperation({ summary: 'Exclui um arquivo do Supabase Storage' })
  async deleteFile(@Param('fileName') fileName: string) {
    return await this.uploadService.deleteFile(fileName);
  }
}
