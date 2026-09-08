import { Controller, Get, Post, Param, Body, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SupportService } from './support.service.js';
import { UserRole } from '../../common/enums/user-role.enum.js';

@ApiTags('Support Tickets & Dispute Desk')
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('tickets')
  @ApiOperation({ summary: 'List support tickets (filtered by user or all for admin)' })
  getTickets(@Query('userId') userId?: string) {
    return this.supportService.getAllTickets(userId);
  }

  @Post('tickets')
  @ApiOperation({ summary: 'Submit a new support or complaint ticket' })
  createTicket(
    @Body() body: { subject: string; message: string; priority?: 'LOW' | 'MEDIUM' | 'HIGH' },
    @Request() req: any,
  ) {
    const user = req.user || { id: 'usr-customer-1', role: UserRole.CUSTOMER };
    return this.supportService.createTicket(user, body.subject, body.message, body.priority);
  }

  @Post('tickets/:id/reply')
  @ApiOperation({ summary: 'Append message to an open support ticket thread' })
  replyTicket(
    @Param('id') id: string,
    @Body() body: { sender?: string; text: string },
  ) {
    return this.supportService.replyTicket(id, body.sender || 'Support Agent', body.text);
  }
}
