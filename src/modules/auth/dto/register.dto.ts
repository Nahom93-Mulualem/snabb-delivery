import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums/user-role.enum.js';

export class RegisterDto {
  @ApiProperty({ enum: UserRole, example: UserRole.CUSTOMER })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '+25163480570', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ example: 'jane.doe@example.com', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 'Password123!', required: false })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ example: 'Bole Road, Addis Ababa', required: false })
  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @ApiProperty({ example: 'Motorcycle / E-Bike', required: false })
  @IsOptional()
  @IsString()
  vehicleType?: string;

  @ApiProperty({ example: 'The Burger Foundry', required: false })
  @IsOptional()
  @IsString()
  restaurantName?: string;
}
