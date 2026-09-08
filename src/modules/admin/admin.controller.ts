import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums/user-role.enum.js';

@ApiTags('Platform Super-Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Platform GMV overview, revenue, active couriers, and delivery metrics' })
  getMetrics() {
    return this.adminService.getPlatformMetrics();
  }

  @Get('users')
  @ApiOperation({ summary: 'List all platform users across roles with statuses' })
  getUsers() {
    return this.adminService.getUsersList();
  }

  @Get('payments')
  @ApiOperation({ summary: 'Escrow payment ledger and merchant/courier disbursement breakdown' })
  getPayments() {
    return this.adminService.getEscrowPayments();
  }

  @Get('locations')
  @ApiOperation({ summary: 'List active city dispatch zones and fleet density' })
  getLocations() {
    return this.adminService.getDispatchLocations();
  }
}
