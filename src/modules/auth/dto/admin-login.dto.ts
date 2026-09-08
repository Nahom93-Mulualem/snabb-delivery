import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@snabb.io' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SNABB-ROOT-KEY-2026', description: 'Super-Admin corporate clearance key' })
  @IsString()
  @IsNotEmpty()
  clearanceKey: string;
}
