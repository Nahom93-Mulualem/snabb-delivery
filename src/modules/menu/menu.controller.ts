import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MenuService } from './menu.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums/user-role.enum.js';

@ApiTags('Menu & Product Catalog')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get full menu catalog with categories and options for a restaurant' })
  getMenu(@Param('restaurantId') restaurantId: string) {
    return this.menuService.getMenuByRestaurant(restaurantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single menu item details and customization options' })
  getMenuItem(@Param('id') id: string) {
    return this.menuService.getMenuItemById(id);
  }

  @Post('restaurant/:restaurantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Add a new product/dish to restaurant menu catalog' })
  addMenuItem(@Param('restaurantId') restaurantId: string, @Body() body: any) {
    return this.menuService.addMenuItem(restaurantId, body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update dish name, price, category, or description' })
  updateMenuItem(@Param('id') id: string, @Body() body: any) {
    return this.menuService.updateMenuItem(id, body);
  }

  @Patch(':id/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Instant stock toggle switch: In Stock or Sold Out' })
  toggleStock(@Param('id') id: string, @Body() body: { inStock: boolean }) {
    return this.menuService.toggleStock(id, body.inStock);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete product from menu catalog' })
  deleteMenuItem(@Param('id') id: string) {
    return this.menuService.deleteMenuItem(id);
  }
}
