import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class TrocarSenhaAdminDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Senha atual é obrigatória' })
  senhaAtual: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Nova senha é obrigatória' })
  @IsString()
  @MinLength(6, {
    message: 'Nova senha deve ter no mínimo 6 caracteres',
  })
  novaSenha: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Confirmação da senha é obrigatória' })
  confirmarNovaSenha: string;
}
