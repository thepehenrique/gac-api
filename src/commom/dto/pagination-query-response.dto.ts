import { ApiProperty } from '@nestjs/swagger';

export class PaginationQueryResponseDto<T> {
  @ApiProperty({ description: 'Registros' })
  content: T[];

  @ApiProperty({ description: 'Total de registros encontrados.' })
  totalRecords: number;

  @ApiProperty({ description: 'Total de páginas.' })
  totalPages: number;

  @ApiProperty({ description: 'Índice da página atual.' })
  currentPage: number;

  @ApiProperty({ description: 'Quantidade de registros na página atual.' })
  pageSize: number;
}
