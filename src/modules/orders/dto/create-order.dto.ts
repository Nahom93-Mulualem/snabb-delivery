import { IsString, IsNotEmpty, IsArray, IsNumber, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ example: 'dish-1' })
  @IsString()
  @IsNotEmpty()
  menuItemId: string;

  @ApiProperty({ example: 'Double Truffle Smash Burger' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 14.5 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ required: false, example: [{ optionName: 'Extra Add-ons', choiceName: 'Bacon', price: 1.8 }] })
  @IsOptional()
  @IsArray()
  selectedOptions?: { optionName: string; choiceName: string; price: number }[];
}

export class CreateOrderDto {
  @ApiProperty({ example: 'smash' })
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ example: 'Bole Medhanialem, Atlas Area, Addis Ababa' })
  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @ApiProperty({ example: 'Door code 4820', required: false })
  @IsOptional()
  @IsString()
  dropOffNote?: string;

  @ApiProperty({ example: 'SUMMERBASH15', required: false })
  @IsOptional()
  @IsString()
  promoCode?: string;

  @ApiProperty({ example: 50.0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tip?: number;

  @ApiProperty({ example: 'Credit Card', required: false })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
