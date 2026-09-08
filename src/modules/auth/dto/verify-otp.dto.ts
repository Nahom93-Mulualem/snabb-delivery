import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({ example: '+25163480570', description: 'International formatted phone number' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: '482901', description: '6-digit SMS OTP verification code' })
  @IsString()
  @Length(4, 6)
  otp: string;
}
