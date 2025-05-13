import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import slugify from 'slugify';

@Injectable()
export class UploadService {
  private supabase;

  constructor() {
    const supabaseURL = process.env.SUPABASE_URL;
    const supabaseKEY = process.env.SUPABASE_KEY;

    this.supabase = createClient(supabaseURL, supabaseKEY);
  }

  async upload(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado.');
    }

    // Verifica se o arquivo é um PDF
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Apenas arquivos PDF são permitidos.');
    }

    const supabaseURL = process.env.SUPABASE_URL;
    const supabaseKEY = process.env.SUPABASE_KEY;

    const supabase = createClient(supabaseURL, supabaseKEY, {
      auth: { persistSession: false },
    });

    const sanitizedFilename = slugify(file.originalname, {
      lower: true,
      remove: /[*+~.()'"!:@]/g,
    });

    const filePath = `uploads/${sanitizedFilename}`;

    // Verifica se o arquivo já existe no Supabase
    const { data: existingFiles, error: listError } = await supabase.storage
      .from('gac-pdf')
      .list('uploads', { search: sanitizedFilename });

    if (listError) {
      throw new Error(
        `Erro ao verificar arquivos existentes: ${listError.message}`,
      );
    }

    if (existingFiles && existingFiles.length > 0) {
      throw new BadRequestException('Já existe um arquivo com este nome.');
    }

    const { data, error } = await supabase.storage
      .from('gac-pdf')
      .upload(filePath, file.buffer, {
        upsert: false,
        contentType: 'application/pdf',
      });

    if (error) {
      throw new Error(`Erro ao fazer upload: ${error.message}`);
    }

    return { message: 'Upload realizado com sucesso!', path: data.path };
  }

  async getFileUrl(fileName: string): Promise<string | null> {
    const { data, error } = await this.supabase.storage
      .from('gac-pdf')
      .createSignedUrl(fileName, 3600 * 24);

    if (error) {
      console.error('Erro ao gerar URL:', error);
      return null;
    }

    return data?.signedUrl || null;
  }

  async deleteFile(fileName: string): Promise<{ message: string }> {
    const { error } = await this.supabase.storage
      .from('gac-pdf')
      .remove([fileName]);

    if (error) {
      throw new NotFoundException(`Erro ao excluir arquivo: ${error.message}`);
    }

    return { message: 'Arquivo excluído com sucesso!' };
  }
}
