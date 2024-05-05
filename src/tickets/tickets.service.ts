import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { User } from '../users/entities/user.entity';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) { }

  async createTicket(createTicketDto: CreateTicketDto, user: User, assignedUserId: User): Promise<Ticket> {

    const newTicket = new Ticket();
    newTicket.title = createTicketDto.title;
    newTicket.description = createTicketDto.description;
    newTicket.status = 'TODO';
    newTicket.point = createTicketDto.point;
    newTicket.histories = [];
    newTicket.assignedUser = assignedUserId;

    newTicket.addHistoryEntry('Ticket Created', user);

    return await this.ticketRepository.save(newTicket);
  }

  async findAll(): Promise<any> {
    const query = `
    SELECT *
    FROM tickets AS t
    LEFT JOIN users AS u ON t.assignedUserId = u.id
  `;

    let newdata = [];
    let response = [];

    const rawData = await this.ticketRepository.query(query);
    rawData.forEach((row) => {
      if (row.assignedUserId) {
        newdata.push(row.id);
        newdata.push(row.assignedUserId);
      }
    })

    const tickets = await this.ticketRepository.find();
    tickets.forEach((ticket) => {
      delete ticket.histories
      response.push({
        ...ticket,
        assignedUserId: newdata[ticket.id]
      })
    })

    return response;
  }

  async findOne(id: number): Promise<Ticket | undefined> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['assignedUser']
    });

    if (!ticket) throw new NotFoundException('Ticket not found');

    return ticket;
  }

  async update(id: number, updateTicketDto: UpdateTicketDto, user: User, assignedUserId: User): Promise<Ticket | undefined> {
    const existingTicket = await this.findOne(id);

    if (!existingTicket) {
      return undefined;
    }

    let title = `edited by ${user.name}`;

    if (assignedUserId) {
      title = `Change Assignees To ${assignedUserId.name}`;
    }

    if (updateTicketDto.status) {
      title = `${user.name} Change Status To ${updateTicketDto.status}`
    }

    existingTicket.title = updateTicketDto.title ?? existingTicket.title;
    existingTicket.description = updateTicketDto.description ?? existingTicket.description;
    existingTicket.status = updateTicketDto.status ?? existingTicket.status;
    existingTicket.point = updateTicketDto.point ?? existingTicket.point;
    existingTicket.assignedUser = assignedUserId ?? existingTicket.assignedUser;

    existingTicket.addHistoryEntry(title, user);

    return await this.ticketRepository.save(existingTicket);
  }

  async delete(id: number): Promise<void> {
    await this.ticketRepository.delete(id);
  }
}
