import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CouriersService } from './couriers.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums/user-role.enum.js';

@ApiTags('Couriers & Fleet Dispatch')
@Controller('couriers')
export class CouriersController {
  constructor(private readonly couriersService: CouriersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get courier profile, vehicle details, and active trip' })
  getCourierProfile(@Param('id') id: string) {
    return this.couriersService.getCourierProfile(id);
  }

  @Patch(':id/duty')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Toggle courier availability mode (Online & Ready / Offline)' })
  updateDuty(
    @Param('id') id: string,
    @Body() body: { isOnline: boolean },
  ) {
    return this.couriersService.updateDuty(id, body.isOnline);
  }

  @Get(':id/available-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get nearby delivery requests ready for courier pickup' })
  getAvailableRequests(@Param('id') id: string) {
    return this.couriersService.getAvailableRequests(id);
  }

  @Post(':id/accept-delivery')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Courier accepts delivery request' })
  acceptDelivery(
    @Param('id') id: string,
    @Body() body: { orderId: string },
  ) {
    return this.couriersService.acceptDelivery(id, body.orderId);
  }

  @Patch(':id/delivery-step')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Advance delivery stepper: arrived, picked_up, on_the_way, delivered' })
  updateStep(
    @Param('id') id: string,
    @Body() body: { orderId: string; step: 'arrived' | 'picked_up' | 'on_the_way' | 'delivered' },
  ) {
    return this.couriersService.updateStep(id, body.orderId, body.step);
  }

  @Get(':id/earnings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get courier earnings breakdown, tips, and weekly trip history' })
  getEarnings(@Param('id') id: string) {
    return this.couriersService.getEarnings(id);
  }

  @Patch(':id/location')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DRIVER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update driver real-time GPS telemetry coordinates' })
  updateLocation(
    @Param('id') id: string,
    @Body() body: { lat: number; lng: number },
  ) {
    return this.couriersService.updateLocation(id, body.lat, body.lng);
  }
}
