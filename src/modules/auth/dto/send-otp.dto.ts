import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ example: '+25163480570', description: 'International formatted phone number' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}
