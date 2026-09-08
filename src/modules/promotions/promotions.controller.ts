import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums/user-role.enum.js';

@ApiTags('Promotions & Vouchers')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all active platform vouchers and discounts' })
  getAll() {
    return this.promotionsService.getAll();
  }

  @Get('validate')
  @ApiOperation({ summary: 'Validate a promo code for a given cart subtotal' })
  validate(
    @Query('code') code: string,
    @Query('subtotal') subtotal: string,
  ) {
    return this.promotionsService.validateCode(code, parseFloat(subtotal) || 0);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new promo code campaign' })
  create(@Body() body: any) {
    return this.promotionsService.create(body);
  }
}
