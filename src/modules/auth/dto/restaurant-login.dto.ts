import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RestaurantLoginDto {
  @ApiProperty({ example: 'owner@smashanddash.se', description: 'Restaurant business email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'merchantPass2026!', description: 'Account password' })
  @IsString()
  @MinLength(6)
  password: string;
}
