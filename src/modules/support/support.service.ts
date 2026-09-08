import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryDbService } from '../../database/in-memory-db.service.js';
import { SupportTicketEntity } from '../../database/entities.js';
import { UserRole } from '../../common/enums/user-role.enum.js';

@Injectable()
export class SupportService {
  constructor(private db: InMemoryDbService) {}

  getAllTickets(userId?: string): SupportTicketEntity[] {
    return this.db.getSupportTickets(userId);
  }

  createTicket(
    user: { id: string; role: UserRole },
    subject: string,
    message: string,
    priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM',
  ): SupportTicketEntity {
    const newTicket: SupportTicketEntity = {
      id: `tkt-${Date.now().toString(36)}`,
      userId: user.id,
      userRole: user.role,
      subject,
      message,
      status: 'OPEN',
      priority,
      messages: [{ sender: user.role, text: message, timestamp: new Date() }],
      createdAt: new Date(),
    };
    return this.db.createSupportTicket(newTicket);
  }

  replyTicket(ticketId: string, sender: string, text: string): SupportTicketEntity {
    const updated = this.db.replySupportTicket(ticketId, sender, text);
    if (!updated) {
      throw new NotFoundException(`Ticket "${ticketId}" not found`);
    }
    return updated;
  }
}
