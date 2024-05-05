import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { TicketService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AuthGuard } from '@nestjs/passport';
import { Ticket } from './entities/ticket.entity';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { UserService } from 'src/users/users.service';

@Controller('/api/tickets')
@UseGuards(AuthGuard())
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly userService: UserService
  ) { }

  @Post()
  async createTicket(@Req() req, @Body() createTicketDto: CreateTicketDto) {
    const assignedUserId = await this.userService.findOne(createTicketDto.assignedUserId);

    const ticket = await this.ticketService.createTicket(createTicketDto, req.user, assignedUserId);
    delete ticket.assignedUser;
    delete ticket.histories;

    return ticket;
  }

  @Get()
  async findAll(): Promise<Ticket[]> {
    const tickets = await this.ticketService.findAll();

    const ticketsWithAssignedUsers = await Promise.all(
      tickets.map(async ticket => {
        delete ticket.status;
        delete ticket.point;

        if (!ticket.assignedUserId) return ticket;

        const assignedUser = await this.userService.findOne(ticket.assignedUserId);

        const assignedName = assignedUser ? assignedUser.name : null;
        const assignedUserPic = assignedUser ? assignedUser.profilePicUrl : null;

        delete ticket.assignedUserId;

        return { ...ticket, assignedName, assignedUserPic };
      }),
    );
    return ticketsWithAssignedUsers;
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<any> {
    const ticket = await this.ticketService.findOne(id);

    const histories = await Promise.all(ticket.histories.map(async (event) => {
      const { name: userName } = await this.userService.findOne(event.userId);
      delete event.userId;

      return { ...event, userName };
    }));

    const assignedName = ticket.assignedUser ? ticket.assignedUser.name : null;
    const assignedUserPic = ticket.assignedUser ? ticket.assignedUser.profilePicUrl : null;

    delete ticket.assignedUser;
    delete ticket.status;
    delete ticket.point;
    delete ticket.histories;

    return {
      ...ticket,
      histories,
      assignedName,
      assignedUserPic
    };
  }

  @Put(':id')
  async update(@Req() req, @Param('id') id: number, @Body() updateTicketDto: UpdateTicketDto): Promise<Ticket | undefined> {
    const assignedUserId = await this.userService.findOne(updateTicketDto.assignedUserId);

    return await this.ticketService.update(id, updateTicketDto, req.user, assignedUserId);
  }
}