import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginAdminDto {
  @ApiProperty({})
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({})
  @IsString()
  @IsNotEmpty()
  senha: string;
}
