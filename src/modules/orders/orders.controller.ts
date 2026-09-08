import { Controller, Get, Post, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums/user-role.enum.js';

@ApiTags('Orders & Live Dispatch Pipeline')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new customer order with basket items, address, and tip' })
  createOrder(@Body() dto: CreateOrderDto, @Request() req: any) {
    const customer = req.user || {
      id: 'usr-customer-1',
      name: 'Sofia Lindqvist',
      phoneNumber: '+25163480570',
    };
    return this.ordersService.createOrder(dto, customer);
  }

  @Get('kanban')
  @ApiOperation({ summary: 'Get live Kanban board categorizing orders for Admin and Restaurant queues' })
  getKanban() {
    return this.ordersService.getKanban();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single order details and milestone history' })
  getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Get(':id/tracking')
  @ApiOperation({ summary: 'Get live GPS telemetry, remaining ETA, and courier location for an order' })
  getTracking(@Param('id') id: string) {
    return this.ordersService.getTracking(id);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get order history for customer profile' })
  getCustomerOrders(@Param('customerId') customerId: string) {
    return this.ordersService.getCustomerOrders(customerId);
  }

  @Get('restaurant/:restaurantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get live kitchen ticket dispatch queue for merchant' })
  getRestaurantOrders(@Param('restaurantId') restaurantId: string) {
    return this.ordersService.getRestaurantOrders(restaurantId);
  }

  @Post(':id/accept')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Kitchen ticket accept with preparation timer (e.g. 15 or 25 minutes)' })
  acceptOrder(
    @Param('id') id: string,
    @Body() body: { prepTimeMinutes?: number },
  ) {
    return this.ordersService.acceptOrder(id, body?.prepTimeMinutes || 15);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Kitchen ticket decline/reject' })
  rejectOrder(@Param('id') id: string) {
    return this.ordersService.rejectOrder(id);
  }

  @Post(':id/ready')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Mark order bagged and ready on counter for driver pickup' })
  markReady(@Param('id') id: string) {
    return this.ordersService.markReady(id);
  }
}
