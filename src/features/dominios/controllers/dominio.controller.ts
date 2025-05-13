import { Controller, Get } from '@nestjs/common';
import { Atividade } from '../entities/atividade.entity';
import { DominioService } from '../services/dominio.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Dominio')
@Controller('dominio')
export class DominioController {
  constructor(private readonly dominioService: DominioService) {}

  @Get('atividade')
  async getAtividade(): Promise<Atividade[]> {
    return this.dominioService.getAtividade();
  }
}
