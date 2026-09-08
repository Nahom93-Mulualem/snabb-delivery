import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Restaurant2faDto {
  @ApiProperty({ example: 'owner@smashanddash.se' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '793421', description: '6-digit authenticator or backup 2FA code' })
  @IsString()
  @Length(4, 8)
  code: string;
}
