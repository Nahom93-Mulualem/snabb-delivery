import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums/user-role.enum.js';

@ApiTags('Restaurants & Merchant Stores')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  @ApiOperation({ summary: 'Discover restaurants with search, cuisine, and filter tags' })
  @ApiQuery({ name: 'search', required: false, description: 'Search keywords (e.g. burger, pizza)' })
  @ApiQuery({ name: 'tag', required: false, description: 'Filter chip (e.g. fast, freedel, toprated, halal, vegan, deal)' })
  @ApiQuery({ name: 'cuisine', required: false, description: 'Cuisine category (e.g. American, Italian, Ethiopian)' })
  findAll(
    @Query('search') search?: string,
    @Query('tag') tag?: string,
    @Query('cuisine') cuisine?: string,
  ) {
    return this.restaurantsService.findAll({ search, tag, cuisine });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full restaurant details and storefront metadata' })
  findById(@Param('id') id: string) {
    return this.restaurantsService.findById(id);
  }

  @Get(':id/analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get restaurant sales KPIs, prep time metrics, and performance' })
  getAnalytics(@Param('id') id: string) {
    return this.restaurantsService.getAnalytics(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Toggle store operating status and order acceptance' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { isOpen: boolean; isAcceptingOrders: boolean },
  ) {
    return this.restaurantsService.updateStatus(id, body.isOpen, body.isAcceptingOrders);
  }

  @Patch(':id/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update restaurant business profile, address, and hours' })
  updateProfile(@Param('id') id: string, @Body() body: any) {
    return this.restaurantsService.updateProfile(id, body);
  }
}
